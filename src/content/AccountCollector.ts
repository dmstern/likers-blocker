import { i18n } from "webextension-polyfill";
import settings from "../settings";
import Storage from "../Storage";
import { UserSet } from "../UserInfo";
import { debounce, tryToAccessDOM } from "../util";
import { default as Icons, default as icons } from "./icons";
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
	private collectedUsers: UserSet;
	private confirmButton: HTMLLinkElement;
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

	public get tweetId() {
		if (!this.cachedTweedId) {
			this.cachedTweedId = location.href
				.replace(/https:\/\/twitter.com\/.*\/status\//g, "")
				.replace("/likes", "");
		}

		return this.cachedTweedId;
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

	// private get users(): UserInfo[] {
	// 	return new UserSet(this.collectedUsers).getUsers();
	// }

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

		if (await TwitterPage.isBlockPage()) {
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
		if (await TwitterPage.isBlockPage()) {
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

		if (await TwitterPage.isBlockPage()) {
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
			: (await this.getScrollList()).querySelectorAll('[data-testid="UserCell"] a[aria-hidden="true"]');
		// Increase allowance for larger lists to avoid false-positive warnings:
		const idleCounterAllowance =
			settings.IDLE_COUNTER_ALLOWANCE + Math.floor(this.collectedUsers.length / 500);
		const totalUserCount = await this.getTotalUsersCount();
		const probablyAlmostReadyThreshold = totalUserCount < 100 ? 70 : totalUserCount < 200 ? 80 : 90;

		const users: HTMLAnchorElement[] = Array.from(userCells);

		for (const userLink of users) {
			const userUrl = userLink.href;
			const userHandle = userUrl.replace("https://twitter.com/", "");
			const user = { screen_name: userHandle, interacted_with: this.tweetId };
			this.collectedUsers.add(user);
		}

		const userCounter = document.querySelector(".lb-user-counter") as HTMLElement;
		if (userCounter) {
			userCounter.innerText = `${this.collectedUsers.length.toLocaleString()}`;
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
			this.progressInPercent = Math.ceil((this.collectedUsers.length / totalUserCount) * 100);
			const progressBarLabel = document.querySelector(".lb-progress-bar__label");
			const progressBar = document.querySelector(".lb-progress-bar__inner") as HTMLElement;

			if (progressBarLabel) {
				progressBarLabel.innerHTML = `${this.progressInPercent}%`;
			}
			if (progressBar) {
				progressBar.style.width = `${this.progressInPercent}%`;
			}
		}

		this.lastCollectedUserCount.push(this.collectedUsers.length);
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
		this.blockButton.style.color = TwitterPage.highlightColor;
		this.blockButton.style.borderColor = TwitterPage.highlightColor;

		const blockButtonLabel = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div > span > span");

		if (blockButtonLabel) {
			blockButtonLabel.innerHTML = i18n.getMessage("ui_blockAll");
		}

		(await this.getTopbar())?.appendChild(this.blockButton);

		// add blockIcon:
		const blockIconWrapper = document.createElement("span");
		blockIconWrapper.innerHTML = Icons.block;
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
		includeRetweetersLink.href = location.href.replace("likes", "retweets");

		labelWrapper.appendChild(includeRetweetersLink);
		return labelWrapper;
	}

	private async createCloseButton() {
		const closeButton = document.createElement("button") as HTMLButtonElement;
		closeButton.innerHTML = Icons.close;
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

	private async createFinishButton() {
		const finishButton = document.createElement("button") as HTMLButtonElement;
		finishButton.innerHTML = `${Icons.forward}${Icons.smile}`;
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
					await this.finishCollecting();
				},
				{
					once: true,
				}
			);
		});
	}

	private async createConfirmButton() {
		const areaWrapper = document.createElement("div");
		const confirmInfo = document.createElement("div");

		areaWrapper.classList.add("lb-confirm-wrapper");
		confirmInfo.classList.add("lb-confirm-info");
		confirmInfo.style.color = this.textStyle.color;
		confirmInfo.innerHTML = `<p>${i18n.getMessage("ui_queue_explanation")}</p>`;
		areaWrapper.appendChild(confirmInfo);

		if (!(await TwitterPage.isBlockPage())) {
			const blockButton = this.blockButton;
			this.confirmButton = blockButton.cloneNode(true) as HTMLLinkElement;
			this.confirmButton.classList.add("lb-confirm-button");
			this.confirmButton.classList.remove("lb-block-button");

			if (!this.isLegacyTwitter) {
				this.confirmButton.querySelector("div > span")?.remove();
			}

			const confirmButtonLabel = this.isLegacyTwitter
				? this.confirmButton
				: (this.confirmButton.querySelector("div > span > span") as HTMLElement);

			confirmButtonLabel.innerText = i18n.getMessage("ui_confirm");
			const confirmButtonIcon = document.createElement("span");
			confirmButtonIcon.innerHTML = icons.send;
			const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
			confirmButtonIconSvg && confirmButtonLabel?.parentElement?.append(confirmButtonIconSvg);
			this.confirmButton.setAttribute("title", i18n.getMessage("ui_external"));

			this.confirmButton.addEventListener(
				"click",
				async () => {
					await Storage.queueMulti(this.collectedUsers.getUsers());
					confirmInfo.innerHTML = `<p>${i18n.getMessage("ui_confirm_clicked")}</p>`;
					confirmButtonIcon.innerHTML = icons.check;
					confirmButtonLabel.innerText = i18n.getMessage("ui_confirm_button_label");

					const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
					confirmButtonIconSvg && confirmButtonLabel?.parentElement?.prepend(confirmButtonIconSvg);
					this.confirmButton.classList.add("lb-confirm-button--clicked");

					// await browser.browserAction.openPopup();

					this.confirmButton.addEventListener("click", async () => {
						await this.closePopup();
					});
				},
				{
					once: true,
				}
			);

			areaWrapper.appendChild(this.confirmButton);
		}

		return areaWrapper;
	}

	private createConfirmMessageElement() {
		this.confirmMessageElement = this.loadingInfo?.cloneNode() as HTMLElement | null;
		if (!this.confirmMessageElement) {
			return;
		}

		Object.assign(this.confirmMessageElement.style, this.textStyle);
		this.confirmMessageElement.classList.remove("lb-collecting");
		this.confirmMessageElement.classList.add("lb-confirm-message");
		this.confirmMessageElement.innerHTML = `
			<h3>
			<span>${i18n.getMessage("ui_usersFound")}</span>
			<span>${i18n.getMessage("ui_blockAll")}?</span>
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

	private async initBlockAction() {
		const popupLabel = this.popup.querySelector(".lb-label") as HTMLElement;
		Object.assign(popupLabel.style, this.textStyle);
		await this.startScrolling();
	}

	private async scrollDown() {
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
			await this.finishCollecting();
		}
	}

	private async finishCollecting(): Promise<void> {
		if (this.hasStateChangedToConfirm) {
			return;
		}

		console.debug("finishCollecting()");

		this.stopScrolling();

		const confirmHeading = this.popup.querySelector(".lb-confirm-message h3 span");

		if (confirmHeading) {
			confirmHeading.innerHTML = `${this.collectedUsers.length.toLocaleString()} ${
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
			(await TwitterPage.isBlockPage()) ||
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
				<div class="lb-progress-bar">
					<div class="lb-progress-bar__inner" style="background-color: ${TwitterPage.highlightColor}">
						<span class="lb-progress-bar__label">0%</span>
						${Icons.checkmark}
					</div>
				</div>
			</div>`;

		await this.createPopup(popupInner);
		this.createConfirmMessageElement();
		const confirmButton = await this.createConfirmButton();

		if (await TwitterPage.isLikesPage()) {
			const includeRetweeters = this.createRetweetersLink();
			this.confirmMessageElement?.querySelector(".lb-label__main")?.appendChild(includeRetweeters);
		}

		this.confirmMessageElement?.querySelector(".lb-label__main")?.appendChild(confirmButton);

		await this.createCloseButton();
		await this.createFinishButton();
		await this.createFooter();
		await this.initBlockAction();
	}

	private async createFooter() {
		const footer = document.createElement("footer");
		const isNewRelease = await Storage.getIsNewRelease();

		footer.innerHTML = `
			<ul class="lb-footer__inner">
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--new-release ${isNewRelease ? "sparkle" : ""}"
						href="https://github.com/dmstern/likers-blocker/releases" target="_blank" title="${i18n.getMessage(
							"ui_newRelease"
						)}">${Icons.sparkles}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--donate ${await AccountCollector.getBadgeClass(
						"donate"
					)}" href="https://github.com/dmstern/likers-blocker#donate" target="_blank" title="${i18n.getMessage(
			"popup_tip"
		)}">${Icons.gift}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__item--report ${await AccountCollector.getBadgeClass(
						"report"
					)}" href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${i18n.getMessage(
			"popup_reportBug"
		)}">${Icons.issue}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--share ${await AccountCollector.getBadgeClass(
						"share"
					)}" href="${i18n.getMessage("tweet_text")}" target="_blank" title="${i18n.getMessage(
			"popup_share"
		)}">${Icons.share}</a>
				</li>
				<li class="lb-footer__item">
					<a class="icon--twitter lb-footer__link lb-footer__link--follow ${await AccountCollector.getBadgeClass(
						"follow"
					)}" href="https://twitter.com/LikersBlocker" target="_blank" title="${i18n.getMessage(
			"popup_follow"
		)}">${Icons.twitter}</a>
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
		if (!(await TwitterPage.isBlockPage())) {
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

		if (!(await TwitterPage.isBlockPage())) {
			return;
		}

		const exportBtn = document.createElement("button");

		exportBtn.innerHTML = Icons.share;
		exportBtn.setAttribute("aria-label", i18n.getMessage("ui_export"));
		exportBtn.setAttribute("title", i18n.getMessage("ui_export"));
		exportBtn.classList.add("lb-btn--export");
		exportBtn.style.backgroundColor = TwitterPage.twitterBrandColor;

		blockedListContainer.appendChild(exportBtn);

		exportBtn.addEventListener("click", () => {
			this.setUpBlockPopup();
		});
	}

	private async startScrolling() {
		(await this.getScrollList()).classList.add("lb-blur");
		(await this.scrolly).scrollTo(0, 0);
		this.collectedUsers = new UserSet();
		this.scrollInterval = window.setInterval(async () => {
			await this.scrollDown();
		}, settings.SCROLL_INTERVAL);
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
