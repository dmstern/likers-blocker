import {debounce, tryToAccessDOM} from "./util";
import Icons from "./icons";
import settings from "./settings";
import TextStyle from "./TextStyle";
import TwitterPage from "./TwitterPage";
import LocalStorage from "./LocalStorage";

const client = typeof browser === "undefined" ? chrome : browser;

const TOPBAR_SELECTOR = {
	mobile: "main > div > div > div > div > div > div",
	desktop: "[aria-labelledby=modal-header] > div > div > div > div > div > div > div > div > div",
};

export default class LikersBlocker {
	public static run(): void {
		// for when we are on the likes page:
		new LikersBlocker();

		// For every other page: try it on click again:
		document.querySelector("body").addEventListener(
			"click",
			() => new LikersBlocker(),
		);

		// Create a new one on resize due to changed viewport:
		window.addEventListener("resize", debounce(() => new LikersBlocker(), 250));
	}

	private blockButton: HTMLAnchorElement;
	private checkbox: HTMLInputElement;
	private collectedUsers: Array<string>;
	private confirmButton: HTMLLinkElement;
	private confirmMessageElement: HTMLElement;
	private legacyTwitter: boolean;
	private likesCount: number;
	private largeList: boolean;
	private popup: HTMLElement;
	private popupWrapper: HTMLElement;
	private requestUrl: string;
	private scrollInterval: number;
	private textarea: HTMLTextAreaElement;
	private topbar: HTMLElement;

	private constructor() {
		window.likersBlocker = undefined;

		this.collectedUsers = [];
		this.requestUrl = "";
		this.likesCount = 0;
		this.isLegacyTwitter = document.getElementById("page-outer") !== null;

		this.setUpLikesCounter();
		this.setUpBlockButton();
		this.setUpExportButton();

		window.likersBlocker = this;
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
		return location.href.replace(/https:\/\/twitter.com\/.*\/status\//g, "").replace(
			"/likes",
			"",
		);
	}

	private get isListLarge() {
		return this.largeList || this.likesCount > settings.SMALL_LIST_LIMIT;
	}

	private get limitMessage() {
		if (TwitterPage.isBlockPage || this.isListLarge) {
			return `${client.i18n.getMessage("ui_takeAMoment")} ${client.i18n.getMessage(
				"ui_urlLimit",
			)}`;
		} else {
			return `${client.i18n.getMessage("ui_onlyListItems")}<br>${client.i18n.getMessage(
				"ui_twitterHides",
			)}`;
		}
	}

	private get loadingInfo() {
		return this.popup.querySelector(".lb-label");
	}

	private getScrollableParent(element: HTMLElement): HTMLElement {
		const parent = element.parentElement;
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

		if (TwitterPage.isBlockPage) {
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

		return (scrollList as HTMLElement);
	}

	private get scrolly(): Promise<HTMLElement> {
		return TwitterPage.isMobile
			? new Promise((resolve) => resolve(document.querySelector("html")))
			: this.getScrollList();
	}

	private get textStyle(): TextStyle {
		let textElement: HTMLElement;
		let style: TextStyle;
		let textElementStyle: CSSStyleDeclaration;

		if (this.isLegacyTwitter) {
			textElement = document.querySelector(".js-tweet-text");
		} else {
			const bioText: HTMLElement = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)",
			);
			const nameText: HTMLElement = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div",
			);
			textElement = bioText || nameText;
		}

		if (!textElement) {
			textElement = document.querySelector("span");
		}

		textElementStyle = getComputedStyle(textElement);
		style = new TextStyle(textElementStyle);

		return style;
	}

	private get users(): Array<string> {
		return Array.from(new Set(this.collectedUsers));
	}

	private async changeStateToConfirm() {
		console.debug("changeStateToConfirm()");
		const collectingMessage = (this.popup.querySelector(
			".lb-label.lb-collecting",
		) as HTMLElement);
		collectingMessage.style.marginTop = `calc(-${collectingMessage.clientHeight}px - 1rem)`;
		this.popup.classList.add("lb-confirm");
		(await this.getScrollList()).classList.remove("lb-blur");
	}

	private async closePopup() {
		this.popup.classList.add("lb-hide");
		this.popup.addEventListener(
			"transitionend",
			() => {
				this.popup.remove();
			},
		);

		this.popupWrapper.remove();
		(await this.getScrollList()).classList.remove("lb-blur");

		// Reset focus on old twitter popup:
		window.setTimeout(
			() => {
				(TwitterPage.popupContainer.querySelector("[data-focusable='true']") as HTMLElement).focus();
			},
			0,
		);
	}

	private async collectUsers() {
		// rome-ignore lint/js/noUndeclaredVariables
		let userCells: NodeListOf<HTMLAnchorElement> = this.isLegacyTwitter
			? (await this.getScrollList()).querySelectorAll("a.js-user-profile-link")
			: (await this.getScrollList()).querySelectorAll(
					'[data-testid="UserCell"] a[aria-hidden="true"]',
				);

		let users: Array<HTMLAnchorElement> = Array.from(userCells);

		for (let userLink of users) {
			const userUrl = userLink.href;
			const userHandle = userUrl.replace("https://twitter.com/", "");
			this.collectedUsers.push(userHandle);
		}

		let userCounter = (document.querySelector(".lb-user-counter") as HTMLElement);
		userCounter.innerText = `${this.users.length}`;
	}

	private async createBlockButton() {
		let followButton: HTMLElement = this.isLegacyTwitter
			? await tryToAccessDOM("button.button-text.follow-text")
			: await tryToAccessDOM(
					"[role=button] [role=button]",
					false,
					1,
					await this.getScrollList(),
				);

		// prevent multiple blockButtons:
		if (document.querySelector("[data-testid=blockAll]")) {
			return;
		}

		this.blockButton = document.createElement("a");
		this.blockButton.classList.add("lb-block-button", ...followButton.classList);
		this.blockButton.dataset.testid = "blockAll";
		this.blockButton.tabIndex = 0;
		this.blockButton.innerHTML = followButton.innerHTML;
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

		this.blockButton.addEventListener(
			"click",
			() => {
				this.setUpBlockPopup();
			},
		);

		this.blockButton.addEventListener(
			"keyup",
			(event) => {
				if (event.key === "Enter") {
					this.setUpBlockPopup();
				}
			},
		);
	}

	private createCheckbox(): HTMLElement {
		this.checkbox = document.createElement("input");
		const label = document.createElement("label");
		const labelWrapper = document.createElement("div");
		labelWrapper.classList.add("lb-label-wrapper");
		labelWrapper.appendChild(label);
		this.checkbox.type = "checkbox";
		this.checkbox.checked = LocalStorage.includeRetweeters;
		this.checkbox.classList.add("lb-checkbox");
		label.innerHTML = `<span>${client.i18n.getMessage("ui_blockRetweeters")}</span>`;
		label.prepend(this.checkbox);
		const retweetersNotice = document.createElement("span");
		retweetersNotice.classList.add("lb-info");
		retweetersNotice.title = client.i18n.getMessage("ui_onlyDirectRetweeters");
		retweetersNotice.innerHTML = Icons.info;
		labelWrapper.appendChild(retweetersNotice);
		return labelWrapper;
	}

	private async createCheckmark() {
		const checkmark = document.createElement("span");
		checkmark.classList.add("lb-checkmark");
		this.loadingInfo.appendChild(checkmark);
		checkmark.innerHTML = Icons.checkmark;

		if (this.checkbox) {
			this.checkbox.addEventListener(
				"change",
				this.handleIncludeRetweetersCheckboxChange,
			);
		}
	}

	handleIncludeRetweetersCheckboxChange = () => {
		let tweetParam: string;
		if (this.checkbox.checked) {
			tweetParam = `&tweet_id=${this.tweetId}`;
		}

		LocalStorage.includeRetweeters = this.checkbox.checked;

		if (this.confirmButton) {
			this.confirmButton.href = `${this.requestUrl}${tweetParam}`;
		}
	};

	private async createCloseButton() {
		const closeButton = (document.createElement("button") as HTMLButtonElement);
		closeButton.innerHTML = Icons.close;
		closeButton.tabIndex = 0;
		closeButton.classList.add("lb-close-button");
		closeButton.title = client.i18n.getMessage("ui_cancel");
		closeButton.style.backgroundColor = TwitterPage.highlightColor.replace(
			")",
			", 0.1)",
		);
		closeButton.style.color = TwitterPage.highlightColor;
		this.popup.prepend(closeButton);
		closeButton.addEventListener(
			"click",
			() => {
				this.closePopup();
				this.stopScrolling();
			},
		);
	}

	private async createFinishButton() {
		const finishButton = (document.createElement("button") as HTMLButtonElement);
		finishButton.innerHTML = Icons.forward;
		finishButton.tabIndex = 0;
		finishButton.classList.add("lb-finish-button");
		finishButton.title = client.i18n.getMessage("ui_finish");
		finishButton.style.backgroundColor = TwitterPage.highlightColor.replace(
			")",
			", 0.1)",
		);
		finishButton.style.color = TwitterPage.highlightColor;
		this.popup.append(finishButton);
		finishButton.addEventListener(
			"click",
			() => {
				this.finishCollecting();
			},
		);
	}

	private createConfirmButton() {
		let areaWrapper = document.createElement("div");
		let copyButton = document.createElement("button");

		areaWrapper.classList.add("lb-copy-wrapper");
		copyButton.classList.add("lb-copy-button");
		copyButton.style.color = this.textStyle.color;
		copyButton.innerHTML = `${Icons.clipboardCopy} <span>${client.i18n.getMessage(
			"ui_copyToShare",
		)}</span>`;
		this.textarea = document.createElement("textarea");
		this.textarea.readOnly = true;
		this.textarea.classList.add("lb-textarea");

		areaWrapper.appendChild(copyButton);
		areaWrapper.appendChild(this.textarea);

		copyButton.addEventListener(
			"click",
			() => {
				this.handleCopyClick(this.textarea, copyButton);
			},
		);

		if (!TwitterPage.isBlockPage) {
			const blockButton = this.blockButton;
			this.confirmButton = (blockButton.cloneNode(true) as HTMLLinkElement);
			this.confirmButton.classList.add("lb-confirm-button");
			this.confirmButton.classList.remove("lb-block-button");

			if (!this.isLegacyTwitter) {
				this.confirmButton.querySelector("div > span").remove();
			}

			const confirmButtonLabel = this.isLegacyTwitter
				? this.confirmButton
				: (this.confirmButton.querySelector("div > span > span") as HTMLElement);

			confirmButtonLabel.innerText = client.i18n.getMessage("ui_ok");
			this.confirmButton.setAttribute("target", "_blank");

			this.confirmButton.addEventListener(
				"click",
				async () => {
					await this.closePopup();
				},
			);

			areaWrapper.appendChild(this.confirmButton);
		}

		return areaWrapper;
	}

	private createConfirmMessageElement() {
		this.confirmMessageElement = (this.loadingInfo.cloneNode() as HTMLElement);
		Object.assign(this.confirmMessageElement.style, this.textStyle);
		this.confirmMessageElement.classList.remove("lb-collecting");
		this.confirmMessageElement.classList.add("lb-confirm-message");
		let heading = document.createElement("h3");
		let headingContent1 = document.createElement("span");
		let headingContent2 = document.createElement("span");

		headingContent1.innerHTML = client.i18n.getMessage("ui_usersFound");
		headingContent2.innerHTML =
			TwitterPage.isBlockPage || this.isListLarge
				? client.i18n.getMessage("ui_divided")
				: `${client.i18n.getMessage("ui_blockAll")}?`;

		headingContent2.classList.add("lb-divided-msg");

		heading.append(headingContent1, headingContent2);
		this.confirmMessageElement.append(heading);
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
		this.popup.style.top = `${(await this.getScrollList()).getBoundingClientRect().top +
		30}px`;
		this.popup.style.background = TwitterPage.backgroundColor;
		this.popup.style.color = TwitterPage.highlightColor;
		this.popup.innerHTML = content;

		window.setTimeout(
			() => {
				this.popup.focus();
			},
			0,
		);

		window.setTimeout(
			() => {
				this.popupWrapper.classList.remove("lb-hide");
			},
			250,
		);

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

	private handleCopyClick(
		textarea: HTMLTextAreaElement,
		copyButton: HTMLButtonElement,
	) {
		textarea.select();
		document.execCommand("copy");
		let copyButtonLabel = copyButton.innerHTML;
		copyButton.innerHTML = `${Icons.clipboardCheck} <span>${client.i18n.getMessage(
			"ui_copied",
		)}</span>`;
		copyButton.style.color = "green";
		copyButton.setAttribute("disabled", "true");

		// Reset button label after a while:
		window.setTimeout(
			() => {
				copyButton.innerHTML = copyButtonLabel;
				copyButton.style.color = this.textStyle.color;
				copyButton.removeAttribute("disabled");
			},
			5_000,
		);
	}

	private async initBlockAction() {
		let animationIterationCounter = 0;

		let loadingIndicator = (this.popup.querySelector(".lb-loading") as HTMLElement);
		loadingIndicator.style.color = TwitterPage.highlightColor;
		const popupLabel = (this.popup.querySelector(".lb-label") as HTMLElement);
		Object.assign(popupLabel.style, this.textStyle);

		const checkAnimationState = () => {
			animationIterationCounter++;

			// only continue when indicator is on the right side:
			if (
				animationIterationCounter % 2 !== 0 &&
				this.popup.classList.contains("lb-check")
			) {
				this.popup.classList.add("lb-collected");
			}
		};

		loadingIndicator.addEventListener("animationiteration", checkAnimationState);

		await this.startScrolling();
	}

	private async scrollDown() {
		console.debug("scrollDown()");
		const scrolly = await this.scrolly;
		const allowanceOffset = 50;
		const scrollListIsSmall = scrolly.scrollHeight < scrolly.clientHeight * 2;
		const scrolledToBottom =
			scrolly.scrollTop >=
			scrolly.scrollHeight - scrolly.clientHeight - allowanceOffset;

		scrolly.scroll({
			top: scrolly.scrollTop + scrolly.clientHeight,
			left: 0,
			behavior: "smooth",
		});

		console.table({
			scrollTop: scrolly.scrollTop,
			compareToScrollTop: scrolly.scrollHeight -
			scrolly.clientHeight -
			allowanceOffset,
			scrollHeight: scrolly.scrollHeight,
			clientHeight: scrolly.clientHeight,
		});

		await this.collectUsers();

		if (scrolledToBottom || scrollListIsSmall) {
			console.info(
				"finished collecting!",
				{
					scrolledToBottom,
					scrollListIsSmall,
				},
			);
			this.finishCollecting();
		}
	}

	private finishCollecting(): void {
		console.debug("finishCollecting()");
		this.requestUrl = `${settings.API_URL_BLOCK}?users=${this.users}`;

		if (this.confirmButton) {
			this.confirmButton.href = this.requestUrl;
		}

		if (this.textarea) {
			this.textarea.value = this.requestUrl;
		}

		if (this.requestUrl.length > settings.URL_LENGTH_MAX) {
			document.querySelector("body").classList.add("many");
			let requestCount = this.requestUrl.length / settings.URL_LENGTH_MAX;
			let usersPerRequest = this.users.length / requestCount;

			for (let i = 0; i <= requestCount; i++) {
				let linkClone = this.textarea.parentNode.cloneNode(true);
				this.textarea.parentNode.parentNode.appendChild(linkClone);
				const textarea = (linkClone.childNodes.item(1) as HTMLTextAreaElement);

				const copyButton = (textarea.parentElement.querySelector(
					".lb-copy-button",
				) as HTMLButtonElement);
				const confirmButton = (textarea.parentElement.querySelector(
					".lb-confirm-button",
				) as HTMLLinkElement);
				const requestUrl = `${settings.API_URL_BLOCK}?users=${this.users.slice(
					usersPerRequest * i,
					usersPerRequest * (i + 1),
				)}`;

				copyButton.addEventListener(
					"click",
					() => {
						this.handleCopyClick(textarea, copyButton);
					},
				);

				textarea.value = requestUrl;

				if (confirmButton) {
					confirmButton.href = requestUrl;
					(confirmButton.querySelector("div > span > span") as HTMLSpanElement).innerText = `${client.i18n.getMessage(
						"ui_confirmButtonLabel",
					)} ${i + 1}`;
				}
			}

			// Remove original after cloning:
			this.textarea.parentNode.parentNode.removeChild(
				document.querySelector(".lb-copy-wrapper"),
			);
		}

		this.stopScrolling();

		const confirmHeading = this.popup.querySelector(
			".lb-confirm-message h3 span",
		);

		if (confirmHeading) {
			confirmHeading.innerHTML = `${this.users.length} ${confirmHeading.innerHTML}`;
		}

		this.popup.classList.add("lb-check");
		const checkmark = this.popup.querySelector(".lb-checkmark");

		checkmark.addEventListener(
			"transitionend",
			async () => {
				await this.changeStateToConfirm();
			},
		);
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
			TwitterPage.isBlockPage ||
			TwitterPage.isTweetPage ||
			TwitterPage.isListPage;

		if (!shouldDisplayOnThisPage) {
			return;
		}

		await this.createBlockButton();
	}

	private async setUpBlockPopup() {
		const popupInner = `
			<div class='lb-label lb-collecting'>
				<h3 id="lb-popup-heading">${client.i18n.getMessage(
			"ui_collectingUsernames",
		)}... <span class="lb-user-counter"></span></h3>
				<p class="lb-text">${this.limitMessage}</p>
				<h1 class="lb-loading-wrapper"><span class='lb-loading'>...</span></h1>
			</div>`;

		await this.createPopup(popupInner);
		this.createConfirmMessageElement();
		let confirmButton = this.createConfirmButton();

		if (TwitterPage.isTweetPage) {
			let checkbox = this.createCheckbox();
			this.confirmMessageElement.appendChild(checkbox);
		}

		this.confirmMessageElement.appendChild(confirmButton);

		await this.createCheckmark();
		await this.createCloseButton();
		await this.createFinishButton();
		await this.createFooter();
		await this.initBlockAction();
	}

	private async createFooter() {
		const footer = document.createElement("footer");
		footer.innerHTML = `
			<ul class="lb-footer__inner">
				<li class="lb-footer__item">
					<a href="https://github.com/dmstern/likers-blocker#sponsor" target="_blank" title="${client.i18n.getMessage(
			"popup_tip",
		)}">${Icons.gift}</a>
				</li>
				<li class="lb-footer__item">
					<a href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${client.i18n.getMessage(
			"popup_reportBug",
		)}">${Icons.issue}</a>
				</li>
				<li class="lb-footer__item">
					<a href="https://twitter.com/share?text=With the @LikersBlocker you can block people that like hate speech.&url=https://dmstern.github.io/likers-blocker&hashtags=LikersBlocker,sayNoToHateSpeech,ichbinhier" target="_blank" title="${client.i18n.getMessage(
			"popup_share",
		)}">${Icons.share}</a>
				</li>
				<li class="lb-footer__item">
					<a href="https://twitter.com/LikersBlocker" class="icon--twitter" target="_blank" title="${client.i18n.getMessage(
			"popup_follow",
		)}">${Icons.twitter}</a>
				</li>
			</ul>
			`;

		footer.style.backgroundColor = TwitterPage.backgroundColor;
		footer.style.color = TwitterPage.highlightColor;
		this.popup.appendChild(footer);
	}

	private setUpExportButton = async () => {
		let isButtonAlreadyAdded = document.querySelector(".lb-btn--export");

		if (isButtonAlreadyAdded) {
			return;
		}

		let blockedListContainer = await tryToAccessDOM("section", true, 3);

		if (!blockedListContainer) {
			return;
		}

		if (!TwitterPage.isBlockPage) {
			return;
		}

		let exportBtn = document.createElement("button");

		exportBtn.innerHTML = Icons.share;
		exportBtn.setAttribute("aria-label", client.i18n.getMessage("ui_export"));
		exportBtn.setAttribute("title", client.i18n.getMessage("ui_export"));
		exportBtn.classList.add("lb-btn--export");
		exportBtn.style.backgroundColor = TwitterPage.twitterBrandColor;

		blockedListContainer.appendChild(exportBtn);

		exportBtn.addEventListener(
			"click",
			() => {
				this.setUpBlockPopup();
			},
		);
	};

	private setUpLikesCounter = async () => {
		let likesCountElement: HTMLElement;

		if (this.isLegacyTwitter) {
			const likesCounterLink = await tryToAccessDOM(
				"[data-tweet-stat-count].request-favorited-popup",
			);
			likesCounterLink.addEventListener("click", () => new LikersBlocker());
			likesCountElement = likesCounterLink.querySelector("strong");
		} else {
			likesCountElement = await tryToAccessDOM(
				"a[href$=likes] > div > span > span",
			);
		}

		const likesCountText = likesCountElement.textContent;
		const chars = likesCountText.split("");
		this.largeList = chars.some((char) => isNaN(Number(char)));

		if (!this.largeList) {
			this.likesCount = parseInt(likesCountText);
		}
	};

	private async startScrolling() {
		(await this.getScrollList()).classList.add("lb-blur");
		(await this.scrolly).scrollTo(0, 0);
		this.collectedUsers = [];
		this.scrollInterval = window.setInterval(
			async () => {
				await this.scrollDown();
			},
			1_600,
		);
	}

	private stopScrolling = () => {
		console.debug("stopScrolling()");
		clearInterval(this.scrollInterval);
	};
}
