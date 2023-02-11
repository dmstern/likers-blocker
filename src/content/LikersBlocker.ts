import { debounce, tryToAccessDOM } from "../util";
import Icons from "./icons";
import icons from "./icons";
import settings from "./settings";
import TextStyle from "./TextStyle";
import TwitterPage, { AccountList } from "./TwitterPage";
import Storage from "../Storage";
import APIService from "../APIService";

const client = typeof browser === "undefined" ? chrome : browser;

const TOPBAR_SELECTOR = {
	mobile: "main > div > div > div > div > div > div",
	desktop: "[aria-labelledby=modal-header] > div > div > div > div > div > div > div > div > div",
};

export default class LikersBlocker {
	private progressInPercent: number;
	private uiIdleCounter: number;
	private readonly lastCollectedUserCount: number[];
	private blockButton: HTMLAnchorElement;
	private checkbox: HTMLInputElement;
	private collectedUsers: string[];
	private confirmButton: HTMLLinkElement;
	private confirmMessageElement: HTMLElement;
	private legacyTwitter: boolean;
	private popup: HTMLElement;
	private popupWrapper: HTMLElement;
	private requestUrl: string;
	private scrollInterval: number;
	private textarea: HTMLTextAreaElement;
	private topbar: HTMLElement;

	private constructor() {
		this.collectedUsers = [];
		this.requestUrl = "";
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
			document.querySelector("body").classList.add("lb-legacy-twitter");
		}
		this.legacyTwitter = legacyTwitter;
	}

	public get tweetId() {
		return location.href.replace(/https:\/\/twitter.com\/.*\/status\//g, "").replace("/likes", "");
	}

	private get loadingInfo() {
		return this.popup.querySelector(".lb-label");
	}

	private get scrolly(): Promise<HTMLElement> {
		return TwitterPage.isMobile
			? new Promise((resolve) => resolve(document.querySelector("html")))
			: this.getScrollList();
	}

	private get textStyle(): TextStyle {
		return TwitterPage.getTextStyle(this.isLegacyTwitter);
	}

	private get users(): string[] {
		return Array.from(new Set(this.collectedUsers));
	}

	private get hasStateChangedToConfirm(): boolean {
		return Array.from(this.popup.classList).some((className) => className === "lb-confirm");
	}

	public static run(): void {
		// for when we are on the likes page:
		new LikersBlocker();

		// For every other page: try it on click again:
		document.querySelector("body").addEventListener("click", () => new LikersBlocker());

		// Create a new one on resize due to changed viewport:
		window.addEventListener(
			"resize",
			debounce(() => new LikersBlocker(), 250)
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
			return;
		}

		const badgeType = Object.entries(badgeTypes).find(([, value]) => !value)[0];
		return linkModifier === badgeType ? "lb-footer__link--show-badge" : "";
	}

	async getTotalUsersCount(): Promise<number> {
		function parseCountFromElement(countElement: HTMLElement): number {
			const likesCountText = countElement.textContent;
			const chars = likesCountText.split("");
			const factors = {
				M: 1_000_000,
				K: 1_000,
			};

			const factor = Object.keys(factors).includes(chars.at(-1)) ? factors[chars.at(-1)] : 1;
			return parseInt(chars.filter((char) => !isNaN(Number(char))).join("")) * factor;
		}

		if (await TwitterPage.isBlockPage()) {
			return -1;
		}

		if (this.isLegacyTwitter) {
			const likesCounterLink = await tryToAccessDOM("[data-tweet-stat-count].request-favorited-popup");
			likesCounterLink.addEventListener("click", () => new LikersBlocker());
			return parseCountFromElement(likesCounterLink.querySelector("strong"));
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

	private async addIncludeRetweetersParam(shouldIncludeRetweeters) {
		Storage.setIncludeRetweeters(shouldIncludeRetweeters);

		const confirmButtons: HTMLLinkElement[] = Array.from(
			document.querySelectorAll(".lb-confirm-button")
		).map((button) => button as HTMLLinkElement);
		const textAreas: HTMLTextAreaElement[] = Array.from(document.querySelectorAll(".lb-textarea")).map(
			(button) => button as HTMLTextAreaElement
		);
		const linkIncludesRetweeters = confirmButtons.every((button) => button.href.includes("tweet_id="));

		if (shouldIncludeRetweeters === linkIncludesRetweeters) {
			return;
		}

		const getRequestUrl = (currentValue: string): string => {
			const blocklistUrl = linkIncludesRetweeters ? currentValue.split("&")[0] : currentValue;
			const includeRetweetersParam: string = linkIncludesRetweeters ? "" : `&tweet_id=${this.tweetId}`;
			return `${blocklistUrl}${includeRetweetersParam}`;
		};

		confirmButtons.forEach((button) => (button.href = getRequestUrl(button.href)));
		textAreas.forEach((textarea) => (textarea.value = getRequestUrl(textarea.value)));
	}

	private isListLarge = async () => {
		return (await this.getTotalUsersCount()) > settings.SMALL_LIST_LIMIT;
	};

	private async getLimitMessage() {
		if ((await TwitterPage.isBlockPage()) || this.isListLarge) {
			return `${client.i18n.getMessage("ui_takeAMoment")} ${client.i18n.getMessage("ui_urlLimit")}`;
		} else {
			return `${client.i18n.getMessage("ui_onlyListItems")}<br>${client.i18n.getMessage(
				"ui_twitterHides"
			)}`;
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
		let fallbackScrollList = document.querySelector("html");
		let scrollList: HTMLElement;

		if (await TwitterPage.isBlockPage()) {
			scrollList = fallbackScrollList;
		} else {
			let defaultScrollList = this.getScrollableParent(await this.getTopbar());
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
		const idleCounterAllowance = settings.IDLE_COUNTER_ALLOWANCE + Math.floor(this.users.length / 500);
		const totalUserCount = await this.getTotalUsersCount();
		const probablyAlmostReadyThreshold = totalUserCount < 100 ? 70 : totalUserCount < 200 ? 80 : 90;

		let users: HTMLAnchorElement[] = Array.from(userCells);

		for (let userLink of users) {
			const userUrl = userLink.href;
			const userHandle = userUrl.replace("https://twitter.com/", "");
			// const response = await APIService.block(userHandle);
			// console.log(response);
			this.collectedUsers.push(userHandle);
		}

		let userCounter = document.querySelector(".lb-user-counter") as HTMLElement;
		if (userCounter) {
			userCounter.innerText = `${this.users.length.toLocaleString()}`;
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
			this.progressInPercent = Math.ceil((this.users.length / totalUserCount) * 100);
			const progressBarLabel = document.querySelector(".lb-progress-bar__label");
			const progressBar = document.querySelector(".lb-progress-bar__inner") as HTMLElement;

			if (progressBarLabel) {
				progressBarLabel.innerHTML = `${this.progressInPercent}%`;
			}
			if (progressBar) {
				progressBar.style.width = `${this.progressInPercent}%`;
			}
		}

		this.lastCollectedUserCount.push(this.users.length);
	}

	private async createBlockButton() {
		let followButton: HTMLElement = this.isLegacyTwitter
			? await tryToAccessDOM("button.button-text.follow-text")
			: await tryToAccessDOM("[role=button] [role=button]", false, 1, await this.getScrollList());

		// prevent multiple blockButtons:
		if (document.querySelector("[data-testid=blockAll]")) {
			return;
		}

		this.blockButton = document.createElement("a");
		this.blockButton.classList.add("lb-block-button", ...followButton?.classList);
		this.blockButton.dataset.testid = "blockAll";
		this.blockButton.tabIndex = 0;
		this.blockButton.innerHTML = followButton?.innerHTML;
		this.blockButton.style.color = TwitterPage.highlightColor;
		this.blockButton.style.borderColor = TwitterPage.highlightColor;

		const blockButtonLabel = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div > span > span");
		blockButtonLabel.innerHTML = client.i18n.getMessage("ui_blockAll");

		(await this.getTopbar()).appendChild(this.blockButton);

		// add blockIcon:
		const blockIconWrapper = document.createElement("span");
		blockIconWrapper.innerHTML = Icons.block;
		blockIconWrapper.style.marginRight = ".3em";
		const blockButtonWrapper = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div");
		blockButtonWrapper.prepend(blockIconWrapper);

		blockIconWrapper.querySelector("svg").style.color = TwitterPage.highlightColor;

		this.blockButton.addEventListener("click", () => {
			this.setUpBlockPopup();
		});

		this.blockButton.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				this.setUpBlockPopup();
			}
		});
	}

	private async createCheckbox(): Promise<HTMLElement> {
		this.checkbox = document.createElement("input");
		const label = document.createElement("label");
		const labelWrapper = document.createElement("div");
		labelWrapper.classList.add("lb-label-wrapper");
		labelWrapper.appendChild(label);
		this.checkbox.type = "checkbox";
		this.checkbox.checked = await Storage.getIncludeRetweeters();
		this.checkbox.classList.add("lb-checkbox");

		this.checkbox.addEventListener("change", () => {
			this.addIncludeRetweetersParam(this.checkbox.checked).then();
		});

		label.innerHTML = `<span>${client.i18n.getMessage("ui_blockRetweeters")}</span>`;
		label.prepend(this.checkbox);
		const retweetersNotice = document.createElement("span");
		retweetersNotice.classList.add("lb-info");
		retweetersNotice.title = client.i18n.getMessage("ui_onlyDirectRetweeters");
		retweetersNotice.innerHTML = Icons.info;
		labelWrapper.appendChild(retweetersNotice);
		return labelWrapper;
	}

	private async createCloseButton() {
		const closeButton = document.createElement("button") as HTMLButtonElement;
		closeButton.innerHTML = Icons.close;
		closeButton.tabIndex = 0;
		closeButton.classList.add("lb-close-button");
		closeButton.title = client.i18n.getMessage("ui_cancel");
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
		finishButton.title = client.i18n.getMessage("ui_finish");
		finishButton.style.backgroundColor = TwitterPage.highlightColor.replace(")", ", 0.1)");
		finishButton.style.color = TwitterPage.highlightColor;
		this.popup.append(finishButton);

		finishButton.addEventListener("click", () => {
			finishButton.classList.add("lb-finish-button--active");
			const finishButtonIcon = finishButton.querySelector("svg");
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
		let areaWrapper = document.createElement("div");
		let copyButton = document.createElement("button");

		areaWrapper.classList.add("lb-copy-wrapper");
		copyButton.classList.add("lb-copy-button");
		copyButton.style.color = this.textStyle.color;
		copyButton.innerHTML = `
			<span class="lb-copy-button__content">
				<span>${Icons.clipboardCopy}</span>
				<span class="lb-copy-button__label">${client.i18n.getMessage("ui_copyToShare")}</span>
			</span>
			<span class="lb-copy-button__content">
				<span>${Icons.clipboardCheck}</span>
				<span class="lb-copy-button__label">${client.i18n.getMessage("ui_copied")}</span>
			</span>
		`;
		this.textarea = document.createElement("textarea");
		this.textarea.readOnly = true;
		this.textarea.classList.add("lb-textarea");

		areaWrapper.appendChild(copyButton);
		areaWrapper.appendChild(this.textarea);

		copyButton.addEventListener("click", () => {
			this.handleCopyClick(this.textarea, copyButton);
		});

		if (!(await TwitterPage.isBlockPage())) {
			const blockButton = this.blockButton;
			this.confirmButton = blockButton.cloneNode(true) as HTMLLinkElement;
			this.confirmButton.classList.add("lb-confirm-button");
			this.confirmButton.classList.remove("lb-block-button");

			if (!this.isLegacyTwitter) {
				this.confirmButton.querySelector("div > span").remove();
			}

			const confirmButtonLabel = this.isLegacyTwitter
				? this.confirmButton
				: (this.confirmButton.querySelector("div > span > span") as HTMLElement);

			confirmButtonLabel.innerText = client.i18n.getMessage("ui_confirm");
			const confirmButtonIcon = document.createElement("span");
			confirmButtonIcon.innerHTML = icons.external;
			confirmButtonLabel.parentElement.append(confirmButtonIcon.querySelector("svg"));
			this.confirmButton.setAttribute("title", client.i18n.getMessage("ui_external"));
			this.confirmButton.setAttribute("target", "_blank");

			this.confirmButton.addEventListener("click", async () => {
				await this.closePopup();
			});

			areaWrapper.appendChild(this.confirmButton);
		}

		return areaWrapper;
	}

	private createConfirmMessageElement() {
		this.confirmMessageElement = this.loadingInfo.cloneNode() as HTMLElement;
		Object.assign(this.confirmMessageElement.style, this.textStyle);
		this.confirmMessageElement.classList.remove("lb-collecting");
		this.confirmMessageElement.classList.add("lb-confirm-message");
		this.confirmMessageElement.innerHTML = `
			<h3>
				<span>${client.i18n.getMessage("ui_usersFound")}</span>
				<span>${client.i18n.getMessage("ui_blockAll")}?</span>
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

	private handleCopyClick(textarea: HTMLTextAreaElement, copyButton: HTMLButtonElement) {
		textarea.select();
		navigator.clipboard.writeText(textarea.value).then(() => {
			copyButton.classList.add("lb-copy-button--active");
			copyButton.setAttribute("disabled", "true");
		});

		// Reset button label after a while:
		window.setTimeout(() => {
			copyButton.classList.remove("lb-copy-button--active");
			copyButton.removeAttribute("disabled");
		}, 5_000);
	}

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
		this.requestUrl = `${settings.API_URL_BLOCK}?users=${this.users}`;
		const listIsLarge = this.requestUrl.length > settings.URL_LENGTH_MAX;
		document.querySelector("body").classList.toggle("many", listIsLarge);

		if (this.confirmButton) {
			this.confirmButton.href = this.requestUrl;
		}

		if (this.textarea) {
			this.textarea.value = this.requestUrl;
		}

		if (listIsLarge) {
			console.info("list is large");
			let requestCount = this.requestUrl.length / settings.URL_LENGTH_MAX;
			let usersPerRequest = this.users.length / requestCount;

			const headingContent2 = document.querySelector(".lb-confirm-message > h3 > span:last-of-type");
			headingContent2.innerHTML = client.i18n.getMessage("ui_divided");
			headingContent2.classList.add("lb-divided-msg");

			for (let i = 0; i <= requestCount; i++) {
				let linkClone = this.textarea.parentNode.cloneNode(true);
				this.textarea.parentNode.parentNode.appendChild(linkClone);
				const textarea = linkClone.childNodes.item(1) as HTMLTextAreaElement;

				const copyButton = textarea.parentElement.querySelector(".lb-copy-button") as HTMLButtonElement;
				const confirmButton = textarea.parentElement.querySelector(
					".lb-confirm-button"
				) as HTMLLinkElement;
				const requestUrl = `${settings.API_URL_BLOCK}?users=${this.users.slice(
					usersPerRequest * i,
					usersPerRequest * (i + 1)
				)}`;

				copyButton.addEventListener("click", () => {
					this.handleCopyClick(textarea, copyButton);
				});

				textarea.value = requestUrl;

				if (confirmButton) {
					confirmButton.href = requestUrl;
					(
						confirmButton.querySelector("div > span > span") as HTMLSpanElement
					).innerText = `${client.i18n.getMessage("ui_confirmButtonLabel")} ${i + 1}`;

					const iconWrapper = document.createElement("span");
					iconWrapper.innerHTML = icons.check;
					confirmButton.querySelector("div > span").prepend(iconWrapper);

					confirmButton.addEventListener("mousedown", (event) => {
						const confirmButton = (event.target as HTMLElement).closest("a");
						confirmButton.classList.add("lb-confirm-button--clicked");
					});
				}
			}

			// Remove original after cloning:
			this.textarea.parentNode.parentNode.removeChild(document.querySelector(".lb-copy-wrapper"));
		}

		if (this.checkbox) {
			await this.addIncludeRetweetersParam(this.checkbox.checked);
		}

		this.stopScrolling();

		const confirmHeading = this.popup.querySelector(".lb-confirm-message h3 span");

		if (confirmHeading) {
			confirmHeading.innerHTML = `${this.users.length.toLocaleString()} ${confirmHeading.innerHTML}`;
		}

		this.popup.classList.add("lb-check", "lb-collected");
		setTimeout(async () => {
			await this.changeStateToConfirm();
		}, 1200);
	}

	private async getTopbar() {
		let heading: HTMLElement;

		if (this.topbar) {
			return this.topbar;
		}

		if (this.isLegacyTwitter) {
			heading = await tryToAccessDOM("#activity-popup-dialog-header");
			this.isLegacyTwitter = true;
			this.topbar = heading.parentElement;
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
					<span>${client.i18n.getMessage("ui_collectingUsernames")}...</span>
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
		let confirmButton = await this.createConfirmButton();

		if (await TwitterPage.isTweetPage()) {
			let checkboxWrapper = await this.createCheckbox();
			this.confirmMessageElement.querySelector(".lb-label__main").appendChild(checkboxWrapper);
		}

		this.confirmMessageElement.querySelector(".lb-label__main").appendChild(confirmButton);

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
						href="https://github.com/dmstern/likers-blocker/releases" target="_blank" title="${client.i18n.getMessage(
							"ui_newRelease"
						)}">${Icons.sparkles}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--donate ${await LikersBlocker.getBadgeClass(
						"donate"
					)}" href="https://github.com/dmstern/likers-blocker#donate" target="_blank" title="${client.i18n.getMessage(
			"popup_tip"
		)}">${Icons.gift}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__item--report ${await LikersBlocker.getBadgeClass(
						"report"
					)}" href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${client.i18n.getMessage(
			"popup_reportBug"
		)}">${Icons.issue}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--share ${await LikersBlocker.getBadgeClass(
						"share"
					)}" href="${client.i18n.getMessage(
			"tweet_text"
		)}" target="_blank" title="${client.i18n.getMessage("popup_share")}">${Icons.share}</a>
				</li>
				<li class="lb-footer__item">
					<a class="icon--twitter lb-footer__link lb-footer__link--follow ${await LikersBlocker.getBadgeClass(
						"follow"
					)}" href="https://twitter.com/LikersBlocker" target="_blank" title="${client.i18n.getMessage(
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
				const classes = Array.from(link.classList);
				const modifierClass = classes.find((className) => className.startsWith(classPrefix));
				const badgeType = modifierClass.replace(classPrefix, "");

				link.classList.remove("lb-footer__link--show-badge");

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

		let isButtonAlreadyAdded = document.querySelector(".lb-btn--export");

		if (isButtonAlreadyAdded) {
			return;
		}

		let blockedListContainer = await tryToAccessDOM("section", true, 3);

		if (!blockedListContainer) {
			return;
		}

		if (!(await TwitterPage.isBlockPage())) {
			return;
		}

		let exportBtn = document.createElement("button");

		exportBtn.innerHTML = Icons.share;
		exportBtn.setAttribute("aria-label", client.i18n.getMessage("ui_export"));
		exportBtn.setAttribute("title", client.i18n.getMessage("ui_export"));
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
		this.collectedUsers = [];
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
			<h4 class="lb-warning__heading">${icons.warn}<span>${client.i18n.getMessage(
			"ui_warningHeading"
		)}</span></h4>
			<span class="lb-warning__text">${client.i18n.getMessage("ui_warningText")}</span>
			<div class="lb-warning__buttons">
				<button class="lb-warning__button lb-warning__button--ok">${client.i18n.getMessage("ui_ok")}</button>
				<button class="lb-warning__button lb-warning__button--hide">${client.i18n.getMessage(
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

		this.popup.querySelector(".lb-warning__button--hide").addEventListener("click", () => {
			Storage.setHideIdleWarning(true);
		});
	}
}
