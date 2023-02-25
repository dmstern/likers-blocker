import { i18n } from "webextension-polyfill";
import FileManager from "../FileManager";
import icons from "../icons";
import settings from "../settings";
import Storage from "../Storage";
import { QueuedUser, UserSet } from "../User";
import { debounce, tryToAccessDOM } from "../util";
import TextStyle from "./TextStyle";
import TwitterPage, { AccountList } from "./TwitterPage";

const TOPBAR_SELECTOR = {
	mobile: "main > div > div > div > div > div > div",
	desktop: "[aria-labelledby=modal-header] > div > div > div > div > div > div > div > div > div",
};

export default class AccountCollector {
	private progressInPercent: number;
	private uiIdleCounter: number;
	private readonly lastCollectedUserCount: number[];
	private blockButton: HTMLAnchorElement;
	private collectedUsers: UserSet<QueuedUser>;
	private confirmMessageElement: HTMLElement | null;
	private legacyTwitter: boolean;
	private popup: HTMLElement;
	private popupWrapper: HTMLElement;
	private scrollInterval: number;
	private topbar: HTMLElement | null | undefined;
	private cachedTweedId: string;

	private constructor() {
		this.collectedUsers = new UserSet();
		this.progressInPercent = 0;
		this.uiIdleCounter = 0;
		this.lastCollectedUserCount = [];
		this.isLegacyTwitter = document.getElementById("page-outer") !== null;

		this.setUpBlockButton().then();
		this.setUpExportButton().then();
		Storage.storePackageVersion().then();
	}

	public get isLegacyTwitter() {
		return this.legacyTwitter;
	}

	public set isLegacyTwitter(legacyTwitter) {
		if (legacyTwitter) {
			document.body.classList.add("lb-legacy-twitter");
		}
		this.legacyTwitter = legacyTwitter;
	}

	private get loadingInfo() {
		return this.popup.querySelector(".lb-label");
	}

	private get scrolly(): Promise<HTMLElement> {
		return TwitterPage.isMobile
			? new Promise((resolve) => resolve(document.documentElement))
			: this.getScrollList();
	}

	private get textStyle(): TextStyle {
		return TwitterPage.getTextStyle(this.isLegacyTwitter);
	}

	private get hasStateChangedToConfirm(): boolean {
		return Array.from(this.popup.classList).some((className) => className === "lb-confirm");
	}

	public static run(): void {
		// for when we are on the likes page:
		new AccountCollector();

		// For every other page: try it on click again:
		document.body.addEventListener("click", () => new AccountCollector());

		// Create a new one on resize due to changed viewport:
		window.addEventListener(
			"resize",
			debounce(() => new AccountCollector(), 250)
		);
	}

	private static async getBadgeClass(linkModifier): Promise<string> {
		const badgeTypes = {
			follow: await Storage.getHideBadgeFollow(),
			share: await Storage.getHideBadgeShare(),
			donate: await Storage.getHideBadgeDonate(),
		};

		const allBadgedDone = Object.values(badgeTypes).every((value) => value);

		if (allBadgedDone) {
			return "";
		}

		const entries = Object.entries(badgeTypes);
		const notHiddenBadgeType = entries.find(([, value]) => !value);
		const badgeType = notHiddenBadgeType ? notHiddenBadgeType[0] : "";
		return linkModifier === badgeType ? "lb-footer__link--show-badge" : "";
	}

	async getTotalUsersCount(): Promise<number> {
		function parseCountFromElement(countElement: HTMLElement | null): number {
			if (!countElement) {
				return -1;
			}

			const likesCountText = countElement.textContent;
			const chars = likesCountText?.split("");
			const factors = {
				M: 1_000_000,
				K: 1_000,
			};

			if (chars) {
				const lastCharacter = chars.at(-1)?.toString();
				const factor = lastCharacter && lastCharacter in factors ? factors[lastCharacter] : 1;
				return parseInt(chars.filter((char) => !isNaN(Number(char))).join("")) * factor;
			}

			return -1;
		}

		if (await TwitterPage.isBlockExportPage()) {
			return -1;
		}

		if (this.isLegacyTwitter) {
			const likesCounterLink = await tryToAccessDOM("[data-tweet-stat-count].request-favorited-popup");
			if (likesCounterLink) {
				likesCounterLink.addEventListener("click", () => new AccountCollector());
				return parseCountFromElement(likesCounterLink.querySelector("strong"));
			}
		}

		const isListPage = (await TwitterPage.isListPage()) as AccountList;
		if (isListPage) {
			return parseCountFromElement(await tryToAccessDOM(`a[href$="${isListPage}"] span span`));
		}

		const usersCountElement = await tryToAccessDOM("a[href$=likes] > div > span > span");
		if (usersCountElement) {
			return parseCountFromElement(usersCountElement);
		}

		return -1;
	}

	private async getLimitMessage() {
		if (await TwitterPage.isBlockExportPage()) {
			return `${i18n.getMessage("ui_takeAMoment")}`;
		} else {
			return `${i18n.getMessage("ui_onlyListItems")}<br>${i18n.getMessage("ui_twitterHides")}`;
		}
	}

	private getScrollableParent(element: HTMLElement): HTMLElement {
		const parent = element.parentElement;

		if (!parent) {
			return element;
		}

		const isParentScrollable = getComputedStyle(parent).overflow === "auto";
		if (isParentScrollable) {
			return parent;
		} else {
			return this.getScrollableParent(parent);
		}
	}

	private async getScrollList(): Promise<HTMLElement> {
		const fallbackScrollList = document.querySelector("html");
		let scrollList: HTMLElement | null;

		if (await TwitterPage.isBlockExportPage()) {
			scrollList = fallbackScrollList;
		} else {
			const topbar = await this.getTopbar();
			const defaultScrollList = topbar ? this.getScrollableParent(topbar) : document.documentElement;
			scrollList = this.isLegacyTwitter
				? document.querySelector(".activity-popup-users")
				: defaultScrollList;
		}

		if (!scrollList) {
			scrollList = fallbackScrollList;
		}

		return scrollList as HTMLElement;
	}

	private async changeStateToConfirm() {
		console.debug("changeStateToConfirm()");
		this.popup.classList.add("lb-confirm");
		(await this.getScrollList()).classList.remove("lb-blur");
	}

	private async closePopup() {
		this.popup.classList.add("lb-hide");
		this.popup.addEventListener("transitionend", () => {
			this.popup.remove();
		});

		this.popupWrapper.remove();
		(await this.getScrollList()).classList.remove("lb-blur");

		window.setTimeout(() => {
			const nativeTwitterPopup = TwitterPage.popupContainer.querySelector(
				"[aria-modal='true']"
			) as HTMLElement;
			if (nativeTwitterPopup) {
				nativeTwitterPopup.focus();
			}
		}, 0);
	}

	private async collectUsers() {
		const userCells: NodeListOf<HTMLAnchorElement> = this.isLegacyTwitter
			? (await this.getScrollList()).querySelectorAll("a.js-user-profile-link")
			: (await this.getScrollList()).querySelectorAll('[data-testid="UserCell"]');
		// Increase allowance for larger lists to avoid false-positive warnings:
		const idleCounterAllowance =
			settings.IDLE_COUNTER_ALLOWANCE + Math.floor(this.collectedUsers.size / 500);
		const totalUserCount = await this.getTotalUsersCount();
		const probablyAlmostReadyThreshold = totalUserCount < 100 ? 70 : totalUserCount < 200 ? 80 : 90;

		const users: HTMLAnchorElement[] = Array.from(userCells);

		for (const userCell of users) {
			const userLink = userCell.querySelector('a[aria-hidden="true"]') as HTMLAnchorElement;
			const profileImg = userCell.querySelector("img") as HTMLImageElement;
			const userUrl = userLink.href;
			const profileUrl = profileImg.src;
			const userHandle = userUrl.replace("https://twitter.com/", "");
			const user = {
				screen_name: userHandle,
				interacted_with: location.pathname,
				profile_image_url_https: profileUrl,
			};

			const wasAdded = this.collectedUsers.add(user);

			if (wasAdded) {
				const avatarsWrapper = document.querySelector(".lb-truck-animation__avatars");

				if (avatarsWrapper) {
					const clonedProfileImg = profileImg.cloneNode() as HTMLImageElement;

					if (clonedProfileImg.src) {
						clonedProfileImg.src = clonedProfileImg.src.replace("normal", "mini");
						clonedProfileImg.removeAttribute("class");
					}

					const avatar = document.createElement("span");
					avatar.classList.add("lb-truck-animation__avatar");
					avatar.style.setProperty("--index", this.collectedUsers.size.toString());
					avatar.append(clonedProfileImg);
					avatarsWrapper.prepend(avatar);
				}
			}
		}

		const userCounter = document.querySelector(".lb-user-counter") as HTMLElement;
		if (userCounter) {
			userCounter.innerText = `${this.collectedUsers.size.toLocaleString()}`;
		}

		const lastTwoCollectionsAreIdentical =
			this.lastCollectedUserCount.at(-1) === this.lastCollectedUserCount.at(-2);

		if (!lastTwoCollectionsAreIdentical) {
			this.uiIdleCounter = 0;
		}

		if (document.hasFocus() && lastTwoCollectionsAreIdentical) {
			this.uiIdleCounter++;

			if (
				this.uiIdleCounter > idleCounterAllowance &&
				this.progressInPercent < probablyAlmostReadyThreshold
			) {
				await this.createIdleWarning();
			}
		}

		if (totalUserCount > 0) {
			this.progressInPercent = Math.ceil((this.collectedUsers.size / totalUserCount) * 100);
			const progressBarLabel = document.querySelector(".lb-progress-bar__label");
			const progressBar = document.querySelector(".lb-progress-bar__inner") as HTMLElement;

			if (progressBarLabel) {
				progressBarLabel.innerHTML = `${this.progressInPercent}%`;
			}
			if (progressBar) {
				progressBar.style.width = `${this.progressInPercent}%`;
			}
		}

		this.lastCollectedUserCount.push(this.collectedUsers.size);
	}

	private async createBlockButton() {
		const followButton = this.isLegacyTwitter
			? await tryToAccessDOM("button.button-text.follow-text")
			: await tryToAccessDOM("[role=button] [role=button]", false, 1, await this.getScrollList());

		// prevent multiple blockButtons:
		if (document.querySelector("[data-testid=blockAll]")) {
			return;
		}

		this.blockButton = document.createElement("a");
		const followButtonClasses = followButton?.classList;

		if (followButtonClasses) {
			this.blockButton.classList.add("lb-block-button", ...followButtonClasses);
		}

		this.blockButton.dataset.testid = "blockAll";
		this.blockButton.tabIndex = 0;
		this.blockButton.innerHTML = followButton ? followButton.innerHTML : "";
		this.blockButton.style.color = "var(--color)";
		this.blockButton.style.borderColor = "var(--border-color)";
		this.blockButton.style.backgroundColor = "var(--background-color);";

		const blockButtonLabel = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div > span > span");

		if (blockButtonLabel) {
			blockButtonLabel.innerHTML = i18n.getMessage("ui_blockAll");
		}

		(await this.getTopbar())?.appendChild(this.blockButton);

		// add blockIcon:
		const blockIconWrapper = document.createElement("span");
		blockIconWrapper.innerHTML = icons.block;
		blockIconWrapper.style.marginRight = ".3em";
		const blockButtonWrapper = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div");
		blockButtonWrapper?.prepend(blockIconWrapper);
		const blockIcon = blockIconWrapper.querySelector("svg");

		if (blockIcon) {
			blockIcon.style.color = TwitterPage.highlightColor;
		}

		this.blockButton.addEventListener("click", () => {
			this.setUpBlockPopup();
		});

		this.blockButton.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				this.setUpBlockPopup();
			}
		});
	}

	private createRetweetersLink(): HTMLElement {
		const includeRetweetersLink = document.createElement("a");
		const labelWrapper = document.createElement("div");

		labelWrapper.classList.add("lb-label-wrapper");
		includeRetweetersLink.target = "_blank";
		includeRetweetersLink.innerHTML = `
			${icons.retweets}
			<span>${i18n.getMessage("ui_blockRetweeters")}</span>
		`;
		includeRetweetersLink.classList.add("lb-link");
		includeRetweetersLink.title = i18n.getMessage("ui_retweetersHoverHint");
		includeRetweetersLink.href = location.href.replace("likes", "retweets");

		labelWrapper.appendChild(includeRetweetersLink);
		return labelWrapper;
	}

	private async createCloseButton() {
		const closeButton = document.createElement("button") as HTMLButtonElement;
		closeButton.innerHTML = icons.close;
		closeButton.tabIndex = 0;
		closeButton.classList.add("lb-close-button");
		closeButton.title = i18n.getMessage("ui_cancel");
		closeButton.style.backgroundColor = TwitterPage.highlightColor.replace(")", ", 0.1)");
		closeButton.style.color = TwitterPage.highlightColor;
		this.popup.prepend(closeButton);
		closeButton.addEventListener("click", () => {
			this.closePopup();
			this.stopScrolling();
		});
	}

	private async createFinishButton(confirmButton: HTMLDivElement) {
		const finishButton = document.createElement("button") as HTMLButtonElement;
		finishButton.innerHTML = `${icons.forward}${icons.smile}`;
		finishButton.tabIndex = 0;
		finishButton.classList.add("lb-finish-button");
		finishButton.title = i18n.getMessage("ui_finish");
		finishButton.style.backgroundColor = TwitterPage.highlightColor.replace(")", ", 0.1)");
		finishButton.style.color = TwitterPage.highlightColor;
		this.popup.append(finishButton);

		finishButton.addEventListener("click", () => {
			finishButton.classList.add("lb-finish-button--active");
			const finishButtonIcon = finishButton.querySelector("svg");

			if (!finishButtonIcon) {
				return;
			}

			finishButtonIcon.addEventListener(
				"transitionend",
				async () => {
					finishButton.disabled = true;
					this.popup.classList.remove("lb-popup--has-warning");
					await this.finishCollecting(confirmButton);
				},
				{
					once: true,
				}
			);
		});
	}

	private async createConfirmButton(): Promise<HTMLDivElement> {
		const areaWrapper = document.createElement("div");
		const confirmInfo = document.createElement("div");
		const isBlockExportPage = await TwitterPage.isBlockExportPage();

		const getLabel = (section: string) => {
			const labels = {
				explanation: {
					block: "ui_block_explanation",
					queue: "ui_queue_explanation",
				},
				confirmTitle: {
					block: "ui_confirm_title_block",
					queue: "ui_confirm_title_queue",
				},
				buttonLabel: {
					block: "ui_download",
					queue: "ui_addToQueue",
				},
				icon: {
					block: icons.download,
					queue: icons.send,
				},
			};

			const key = isBlockExportPage ? "block" : "queue";
			return labels[section][key];
		};

		areaWrapper.classList.add("lb-confirm-wrapper");
		confirmInfo.classList.add("lb-confirm-info");
		confirmInfo.style.color = this.textStyle.color;
		const explanationLabel = getLabel("explanation");
		confirmInfo.innerHTML = `<p>${i18n.getMessage(explanationLabel)}</p>`;
		areaWrapper.appendChild(confirmInfo);

		let confirmButton: HTMLAnchorElement | HTMLDivElement;

		if (isBlockExportPage) {
			const firstOriginalBlockButton = document.querySelector("[data-testid=UserCell] [role=button]");
			confirmButton = document.createElement("a");
			confirmButton.innerHTML = firstOriginalBlockButton.innerHTML;
			confirmButton.classList.add(...firstOriginalBlockButton.classList);
		} else {
			confirmButton = this.blockButton.cloneNode(true) as HTMLAnchorElement;
		}

		confirmButton.classList.add("lb-confirm-button");
		confirmButton.classList.remove("lb-block-button");
		const confirmTitle = getLabel("confirmTitle");
		confirmButton.title = i18n.getMessage(confirmTitle);
		confirmButton.style.backgroundColor = "var(--background-color)";
		confirmButton.style.color = "var(--color)";
		areaWrapper.appendChild(confirmButton);

		if (!this.isLegacyTwitter && !isBlockExportPage) {
			confirmButton.querySelector("div > span")?.remove();
		}

		const confirmButtonLabel = this.isLegacyTwitter
			? confirmButton
			: (confirmButton.querySelector("div > span > span") as HTMLElement);

		confirmButtonLabel.innerText = i18n.getMessage(getLabel("buttonLabel"));
		const confirmButtonIcon = document.createElement("span");
		confirmButtonIcon.innerHTML = getLabel("icon");
		const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
		confirmButtonIconSvg && confirmButtonLabel?.parentElement?.append(confirmButtonIconSvg);

		if (!isBlockExportPage) {
			confirmButton.addEventListener(
				"click",
				() => {
					this.addToQueue(confirmInfo, confirmButtonIcon, confirmButtonLabel, confirmButton);
					this.popup.classList.add("lb-confirmed");
				},
				{
					once: !isBlockExportPage,
				}
			);
		}

		return areaWrapper;
	}

	private async addToQueue(
		confirmInfo: HTMLElement,
		confirmButtonIcon: HTMLElement,
		confirmButtonLabel: HTMLElement,
		confirmButton: HTMLElement
	) {
		await Storage.queueMulti(this.collectedUsers.toArray());
		confirmInfo.innerHTML = `<p>${i18n.getMessage("ui_confirm_clicked")}</p>`;
		confirmButtonIcon.innerHTML = icons.check;
		confirmButtonLabel.innerText = i18n.getMessage("ui_confirm_button_label");

		const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
		confirmButtonIconSvg && confirmButtonLabel?.parentElement?.prepend(confirmButtonIconSvg);
		confirmButton.classList.add("lb-confirm-button--clicked");

		confirmButton.addEventListener("click", async () => {
			await this.closePopup();
		});
	}

	private async createConfirmMessageElement() {
		this.confirmMessageElement = this.loadingInfo?.cloneNode() as HTMLElement | null;
		if (!this.confirmMessageElement) {
			return;
		}

		Object.assign(this.confirmMessageElement.style, this.textStyle);
		this.confirmMessageElement.classList.remove("lb-collecting");
		this.confirmMessageElement.classList.add("lb-confirm-message");

		const confirmHeadingAddon = (await TwitterPage.isBlockExportPage())
			? ""
			: `<span>${i18n.getMessage("ui_blockAll")}?</span>`;

		this.confirmMessageElement.innerHTML = `
			<h3>
				<span>${i18n.getMessage("ui_usersFound")}.</span>
				${confirmHeadingAddon}
			</h3>
			<div class="lb-label__main"></div>`;

		this.popup.appendChild(this.confirmMessageElement);
	}

	private async createPopup(content) {
		this.popupWrapper = document.createElement("div");
		TwitterPage.popupContainer.appendChild(this.popupWrapper);
		this.popupWrapper.classList.add("lb-popup-wrapper", "lb-hide");
		this.popup = document.createElement("div");
		this.popupWrapper.appendChild(this.popup);
		this.popup.tabIndex = 0;
		this.popup.setAttribute("aria-modal", "true");
		this.popup.setAttribute("aria-labeledby", "lb-popup-heading");
		this.popup.dataset.focusable = "true";
		this.popup.classList.add("lb-popup");
		this.popup.style.background = TwitterPage.backgroundColor;
		this.popup.style.color = TwitterPage.highlightColor;
		this.popup.style.setProperty("--background-color", TwitterPage.backgroundColor);
		this.popup.style.setProperty("--color", this.textStyle.color);
		this.popup.style.setProperty("--highlight-color", TwitterPage.highlightColor);
		this.popup.innerHTML = content;

		window.setTimeout(() => {
			this.popup.focus();
		}, 0);

		window.setTimeout(() => {
			this.popupWrapper.classList.remove("lb-hide");
		}, 250);

		document.addEventListener("keydown", this.handleKeydown);
	}

	private handleKeydown = async (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			this.stopScrolling();
			await this.closePopup();
		}

		const circleTabInModalPopup = () => {
			const focusIsInPopup = this.popup.matches(":focus-within");
			if (event.key === "Tab" && !focusIsInPopup) {
				this.popup.focus();
			}
		};

		window.setTimeout(circleTabInModalPopup, 0);
	};

	private async initBlockAction(confirmButton: HTMLDivElement) {
		const popupLabel = this.popup.querySelector(".lb-label") as HTMLElement;
		Object.assign(popupLabel.style, this.textStyle);
		await this.startScrolling(confirmButton);
	}

	private async scrollDown(confirmButton: HTMLDivElement) {
		console.debug("scrollDown()");
		const scrolly = await this.scrolly;
		const scrollListIsSmall = scrolly.scrollHeight < scrolly.clientHeight * 2;
		const scrollTop = Math.ceil(scrolly.scrollTop);
		const compareHeight = scrolly.scrollHeight - scrolly.clientHeight;
		const scrolledToBottom = scrollTop >= compareHeight;
		const allUsersCollected = this.progressInPercent === 100;

		scrolly.scroll({
			top: scrolly.scrollTop + scrolly.clientHeight,
			left: 0,
			behavior: "smooth",
		});

		await this.collectUsers();

		if (scrolledToBottom || scrollListIsSmall || allUsersCollected) {
			console.info("finished collecting!", {
				scrolledToBottom,
				scrollListIsSmall,
			});
			await this.finishCollecting(confirmButton);
		}
	}

	private async finishCollecting(confirmButton: HTMLDivElement): Promise<void> {
		if (this.hasStateChangedToConfirm) {
			return;
		}

		console.debug("finishCollecting()");

		this.stopScrolling();

		if (await TwitterPage.isBlockExportPage()) {
			await Storage.addBlockedMulti(this.collectedUsers.toArray());
			const blockedAccounts = await Storage.getBlockedAccounts();
			const { filename, url } = FileManager.getDownloadLinkForBlockList(blockedAccounts);
			const downloadLink: HTMLAnchorElement = confirmButton.querySelector("a") as HTMLAnchorElement;
			downloadLink.href = url;
			downloadLink.download = filename;
		}

		const confirmHeading = this.popup.querySelector(".lb-confirm-message h3 span");

		if (confirmHeading) {
			confirmHeading.innerHTML = `${this.collectedUsers.size.toLocaleString()} ${
				confirmHeading.innerHTML
			}`;
		}

		this.popup.classList.add("lb-check", "lb-collected");
		setTimeout(async () => {
			await this.changeStateToConfirm();
		}, 1200);
	}

	private async getTopbar() {
		let heading: HTMLElement | null;

		if (this.topbar) {
			return this.topbar;
		}

		if (this.isLegacyTwitter) {
			heading = await tryToAccessDOM("#activity-popup-dialog-header");
			this.isLegacyTwitter = true;
			this.topbar = heading?.parentElement;
		} else {
			this.topbar = await tryToAccessDOM(TOPBAR_SELECTOR[TwitterPage.viewport]);
		}

		return this.topbar;
	}

	private async setUpBlockButton() {
		const shouldDisplayOnThisPage =
			(await TwitterPage.isBlockExportPage()) ||
			(await TwitterPage.isTweetPage()) ||
			(await TwitterPage.isListPage()) !== false;

		if (!shouldDisplayOnThisPage) {
			return;
		}

		await this.createBlockButton();
	}

	private async setUpBlockPopup() {
		const popupInner = `
			<div class="lb-label lb-collecting">
				<h3 id="lb-popup-heading">
					<span>${i18n.getMessage("ui_collectingUsernames")}...</span>
					<span class="lb-user-counter"></span>
				</h3>
				<p class="lb-text">${await this.getLimitMessage()}</p>
				<p class="lb-text">
					${icons.speedometer}&nbsp;
					${i18n.getMessage("ui_scrollSpeed")}
				</p>
				<div class="lb-progress-bar">
					<div class="lb-progress-bar__inner" style="background-color: ${TwitterPage.highlightColor}">
						<span class="lb-progress-bar__label">0%</span>
						${icons.checkmark}
					</div>
				</div>
			</div>`;

		await this.createPopup(popupInner);
		await this.createConfirmMessageElement();
		const confirmButton = await this.createConfirmButton();

		if (await TwitterPage.isLikesPage()) {
			const includeRetweeters = this.createRetweetersLink();
			this.confirmMessageElement?.querySelector(".lb-label__main")?.appendChild(includeRetweeters);
		}

		this.confirmMessageElement?.querySelector(".lb-label__main")?.appendChild(confirmButton);

		await this.createCloseButton();
		await this.createFooter();
		await this.createFinishButton(confirmButton);
		await this.initBlockAction(confirmButton);
	}

	private async createFooter() {
		const footer = document.createElement("footer");
		const isNewRelease = await Storage.getIsNewRelease();

		footer.innerHTML = `
			<div class="lb-truck-animation">
				<div class="lb-truck-animation__avatars">
					<div class="lb-truck-animation__hider"></div>
				</div>
				<div class="lb-truck-animation__truck">
						${icons.truckSolid}
				</div>
			</div>

			<ul class="lb-footer__inner">
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--new-release ${isNewRelease ? "sparkle" : ""}"
						href="https://github.com/dmstern/likers-blocker/releases" target="_blank" title="${i18n.getMessage(
							"ui_newRelease"
						)}">${icons.sparkles}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--donate ${await AccountCollector.getBadgeClass(
						"donate"
					)}" href="https://github.com/dmstern/likers-blocker#donate" target="_blank" title="${i18n.getMessage(
			"popup_tip"
		)}">${icons.gift}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__item--report ${await AccountCollector.getBadgeClass(
						"report"
					)}" href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${i18n.getMessage(
			"popup_reportBug"
		)}">${icons.issue}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--share ${await AccountCollector.getBadgeClass(
						"share"
					)}" href="${i18n.getMessage("tweet_text")}" target="_blank" title="${i18n.getMessage(
			"popup_share"
		)}">${icons.share}</a>
				</li>
				<li class="lb-footer__item">
					<a class="icon--twitter lb-footer__link lb-footer__link--follow ${await AccountCollector.getBadgeClass(
						"follow"
					)}" href="https://twitter.com/LikersBlocker" target="_blank" title="${i18n.getMessage(
			"popup_follow"
		)}">${icons.twitter}</a>
				</li>
			</ul>
			`;

		footer.style.backgroundColor = TwitterPage.backgroundColor;
		footer.style.color = TwitterPage.highlightColor;
		this.popup.appendChild(footer);

		footer.querySelectorAll(".lb-footer__link.lb-footer__link--show-badge").forEach((link) => {
			link.addEventListener("click", (event) => {
				const classPrefix = "lb-footer__link--";
				const link = (event.target as HTMLElement).closest("a");
				const classes = link ? Array.from(link.classList) : [];
				const modifierClass = classes.find((className) => className.startsWith(classPrefix));
				const badgeType = modifierClass?.replace(classPrefix, "");

				link?.classList.remove("lb-footer__link--show-badge");

				switch (badgeType) {
					case "follow": {
						Storage.setHideBadgeFollow(true);
						break;
					}
					case "share": {
						Storage.setHideBadgeShare(true);
						break;
					}
					case "donate": {
						Storage.setHideBadgeDonate(true);
						break;
					}
				}
			});
		});
	}

	private async setUpExportButton() {
		if (!(await TwitterPage.isBlockExportPage())) {
			return;
		}

		const isButtonAlreadyAdded = document.querySelector(".lb-btn--export");

		if (isButtonAlreadyAdded) {
			return;
		}

		const blockedListContainer = await tryToAccessDOM("section", true, 3);

		if (!blockedListContainer) {
			return;
		}

		if (!(await TwitterPage.isBlockExportPage())) {
			return;
		}

		const exportBtn = document.createElement("button");

		exportBtn.innerHTML = icons.share;
		exportBtn.setAttribute("aria-label", i18n.getMessage("ui_export"));
		exportBtn.setAttribute("title", i18n.getMessage("ui_export"));
		exportBtn.classList.add("lb-btn--export");
		exportBtn.style.backgroundColor = TwitterPage.highlightColor;

		blockedListContainer.appendChild(exportBtn);

		exportBtn.addEventListener("click", () => {
			this.setUpBlockPopup();
		});
	}

	private async startScrolling(confirmButton: HTMLDivElement) {
		(await this.getScrollList()).classList.add("lb-blur");
		(await this.scrolly).scrollTo(0, 0);
		this.collectedUsers = new UserSet();
		const scrollsPerMinute = await Storage.getScrollsPerMinute();
		const scrollInterval = Math.round((60 / scrollsPerMinute) * 1000);
		this.scrollInterval = window.setInterval(async () => {
			await this.scrollDown(confirmButton);
		}, scrollInterval);
	}

	private stopScrolling = () => {
		console.debug("stopScrolling()");
		clearInterval(this.scrollInterval);
	};

	private async createIdleWarning() {
		if (
			(await Storage.getHideIdleWarning()) ||
			Array.from(this.popup.classList).includes("lb-popup--has-warning") ||
			this.hasStateChangedToConfirm
		) {
			return;
		}

		const warning = document.createElement("div");
		warning.style.backgroundColor = TwitterPage.backgroundColor;
		warning.classList.add("lb-warning");
		warning.innerHTML = `
			<h4 class="lb-warning__heading">${icons.warn}<span>${i18n.getMessage("ui_warningHeading")}</span></h4>
			<span class="lb-warning__text">${i18n.getMessage("ui_warningText")}</span>
			<div class="lb-warning__buttons">
				<button class="lb-warning__button lb-warning__button--ok">${i18n.getMessage("ui_ok")}</button>
				<button class="lb-warning__button lb-warning__button--hide">${i18n.getMessage(
					"ui_doNotShowAgain"
				)}</button>
			</div>
		`;

		this.popup.append(warning);
		this.popup.classList.add("lb-popup--has-warning");

		warning.style.color = this.textStyle.color;
		warning.style.fontFamily = this.textStyle.fontFamily;
		warning.style.fontStyle = this.textStyle.fontStyle;
		warning.style.fontWeight = this.textStyle.fontWeight;

		this.popup.querySelectorAll(".lb-warning__button").forEach((button) => {
			button.addEventListener("click", () => {
				this.popup.classList.remove("lb-popup--has-warning");
				this.uiIdleCounter = -1;

				warning.addEventListener("transitionend", () => {
					this.popup.removeChild(warning);
				});
			});
		});

		this.popup.querySelector(".lb-warning__button--hide")?.addEventListener("click", () => {
			Storage.setHideIdleWarning(true);
		});
	}
}
