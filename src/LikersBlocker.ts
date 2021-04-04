import {debounce, tryToAccessDOM} from "./util";
import Icons from "./icons";
import settings from "./settings";
import TextStyle from "./TextStyle";

// rome-ignore lint/js/noUndeclaredVariables
const client = browser || chrome;

const TOPBAR_SELECTOR = {
	mobile: "main > div > div > div > div > div > div",
	desktop: "[aria-labelledby=modal-header] > div > div > div > div > div",
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

	public get isMobile(): boolean {
		return document.documentElement.clientWidth < 699;
	}

	public get tweetId() {
		return location.href.replace(/https:\/\/twitter.com\/.*\/status\//g, "").replace(
			"/likes",
			"",
		);
	}

	public get viewport() {
		return this.isMobile ? "mobile" : "desktop";
	}

	private get backgroundColor() {
		return getComputedStyle(document.querySelector("body")).backgroundColor;
	}

	private get highlightColor() {
		if (!this.topbar) {
			return getComputedStyle(document.querySelector("[href='/compose/tweet']")).backgroundColor;
		}

		return getComputedStyle(this.topbar.querySelector("svg")).color;
	}

	private get isBlockPage(): boolean {
		let isBlockPage =
			location.href.endsWith("blocked/all") ||
			location.href.endsWith("settings/content_preferences");

		document.querySelector("body").classList[`${isBlockPage ? "add" : "remove"}`](
			"lb-block-page",
		);

		return isBlockPage;
	}

	private get isListLarge() {
		return this.likesCount > settings.LIKERS_LIMIT;
	}

	private get isListPage(): boolean {
		return (
			location.href.includes("list") &&
			(location.href.endsWith("members") ||
			location.href.endsWith("subscribers"))
		);
	}

	private get isTweetPage(): boolean {
		return location.href.includes("status");
	}

	private get limitMessage() {
		if (this.isBlockPage) {
			return `${client.i18n.getMessage("ui_takeAMoment")} ${client.i18n.getMessage(
				"ui_urlLimit",
			)}`;
		}
		if (this.isListLarge) {
			return `${client.i18n.getMessage("ui_technicalConstraints")}
			<span class="lb-info" title="${client.i18n.getMessage("ui_repeatBlocking")}">
				${Icons.info}
			</span>`;
		} else {
			return `${client.i18n.getMessage("ui_onlyListItems")}<br>${client.i18n.getMessage(
				"ui_twitterHides",
			)}`;
		}
	}

	private get loadingInfo() {
		return this.popup.querySelector(".lb-label");
	}

	private get popupContainer(): HTMLElement {
		const modalDialog = (document.querySelector("[aria-modal=true]") as HTMLElement);
		return modalDialog || (document.querySelector("body") as HTMLElement);
	}

	private get scrollList(): HTMLElement {
		let fallbackScrollList = document.querySelector("html");
		let scrollList: HTMLElement;

		if (this.isBlockPage) {
			scrollList = fallbackScrollList;
		} else {
			let defaultScrollList = ((((((this.topbar?.parentNode)?.parentNode)?.parentNode)?.parentNode)?.children)[1].children[0] as HTMLElement);
			scrollList = this.isLegacyTwitter
				? document.querySelector(".activity-popup-users")
				: defaultScrollList;
		}

		if (!scrollList) {
			scrollList = fallbackScrollList;
		}

		return (scrollList as HTMLElement);
	}

	private get scrolly() {
		return this.isMobile ? document.querySelector("html") : this.scrollList;
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

	private changeStateToConfirm() {
		const collectingMessage = (this.popup.querySelector(
			".lb-label.lb-collecting",
		) as HTMLElement);
		collectingMessage.style.marginTop = `calc(-${collectingMessage.clientHeight}px - 1rem)`;
		this.popup.classList.add("lb-confirm");
		this.scrollList.classList.remove("lb-blur");
	}

	private closePopup(): void {
		this.popup.classList.add("lb-hide");
		this.popup.addEventListener(
			"transitionend",
			() => {
				this.popup.remove();
			},
		);

		this.popupWrapper.remove();
		this.scrollList.classList.remove("lb-blur");

		// Reset focus on old twitter popup:
		setTimeout(
			() => {
				(this.popupContainer.querySelector("[data-focusable='true']") as HTMLElement).focus();
			},
			0,
		);
	}

	private collectUsers() {
		// rome-ignore lint/js/noUndeclaredVariables
		let userCells: NodeListOf<HTMLAnchorElement> = this.isLegacyTwitter
			? this.scrollList.querySelectorAll("a.js-user-profile-link")
			: this.scrollList.querySelectorAll(
					'[data-testid="UserCell"] > div > div > div > div > a',
				);

		let users: Array<HTMLAnchorElement> = Array.from(userCells);

		for (let userLink of users) {
			let userUrl = userLink.href;

			this.collectedUsers.push(userUrl.replace("https://twitter.com/", ""));
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
					this.scrollList,
				);

		// prevent multiple blockButtons:
		if (document.querySelector("[data-testid=blockAll")) {
			return;
		}

		this.blockButton = document.createElement("a");
		this.blockButton.classList.add("lb-block-button", ...followButton.classList);
		this.blockButton.dataset.testid = "blockAll";
		this.blockButton.tabIndex = 0;
		this.blockButton.innerHTML = followButton.innerHTML;
		this.blockButton.style.color = this.highlightColor;
		this.blockButton.style.borderColor = this.highlightColor;

		const blockButtonLabel = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div > span > span");
		blockButtonLabel.innerHTML = client.i18n.getMessage("ui_blockAll");

		this.topbar.appendChild(this.blockButton);

		// add blockIcon:
		const blockIconWrapper = document.createElement("span");
		blockIconWrapper.innerHTML = Icons.block;
		blockIconWrapper.style.marginRight = ".3em";
		const blockButtonWrapper = this.isLegacyTwitter
			? this.blockButton
			: this.blockButton.querySelector("div");
		blockButtonWrapper.prepend(blockIconWrapper);

		blockIconWrapper.querySelector("svg").style.color = this.highlightColor;

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

	private createCheckmark() {
		const checkmark = document.createElement("span");
		checkmark.classList.add("lb-checkmark");
		this.loadingInfo.appendChild(checkmark);
		checkmark.style.background = this.highlightColor;
		checkmark.innerHTML = Icons.checkmark;

		if (this.checkbox) {
			this.checkbox.addEventListener(
				"change",
				() => {
					let tweetParam: string;
					if (this.checkbox.checked) {
						tweetParam = `&tweet_id=${this.tweetId}`;
					}

					if (this.confirmButton) {
						this.confirmButton.href = `${this.requestUrl}${tweetParam}`;
					}
				},
			);
		}
	}

	private createCloseButton() {
		const closeButton = (document.createElement("button") as HTMLButtonElement);
		closeButton.innerHTML = Icons.close;
		closeButton.tabIndex = 0;
		closeButton.classList.add("lb-close-button");
		closeButton.title = client.i18n.getMessage("ui_cancel");
		closeButton.style.backgroundColor = this.highlightColor.replace(
			")",
			", 0.1)",
		);
		closeButton.style.color = this.highlightColor;
		this.popup.prepend(closeButton);
		closeButton.addEventListener(
			"click",
			() => {
				this.closePopup();
				this.stopScrolling();
			},
		);
	}

	private createConfirmButton() {
		if (this.isBlockPage) {
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

			return areaWrapper;
		} else {
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
			this.confirmButton.target = "_blank";

			this.confirmButton.addEventListener(
				"click",
				() => {
					this.closePopup();
				},
			);

			return this.confirmButton;
		}
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
		headingContent2.innerHTML = this.isBlockPage
			? client.i18n.getMessage("ui_divided")
			: `${client.i18n.getMessage("ui_blockAll")}?`;

		if (this.isBlockPage) {
			headingContent2.classList.add("lb-divided-msg");
		}

		heading.append(headingContent1, headingContent2);
		this.confirmMessageElement.append(heading);
		this.popup.appendChild(this.confirmMessageElement);
	}

	private createPopup(content) {
		this.popupWrapper = document.createElement("div");
		this.popupContainer.appendChild(this.popupWrapper);
		this.popupWrapper.classList.add("lb-popup-wrapper", "lb-hide");
		this.popup = document.createElement("div");
		this.popupWrapper.appendChild(this.popup);
		this.popup.tabIndex = 0;
		this.popup.setAttribute("aria-modal", "true");
		this.popup.setAttribute("aria-labeledby", "lb-popup-heading");
		this.popup.dataset.focusable = "true";
		this.popup.classList.add("lb-popup");
		this.popup.style.top = `${this.scrollList.getBoundingClientRect().top + 30}px`;
		this.popup.style.background = this.backgroundColor;
		this.popup.style.color = this.highlightColor;
		this.popup.innerHTML = content;

		setTimeout(
			() => {
				this.popup.focus();
			},
			0,
		);

		setTimeout(
			() => {
				this.popupWrapper.classList.remove("lb-hide");
			},
			250,
		);

		document.addEventListener(
			"keydown",
			(event) => {
				if (event.key === "Escape") {
					this.stopScrolling();
					this.closePopup();
				}

				const circleTabInModalPopup = () => {
					const focusIsInPopup = this.popup.matches(":focus-within");
					if (event.key === "Tab" && !focusIsInPopup) {
						this.popup.focus();
					}
				};

				setTimeout(circleTabInModalPopup, 0);
			},
		);
	}

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
		setTimeout(
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
		loadingIndicator.style.color = this.highlightColor;
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

		this.shrinkPopupToVisibleContent();
		this.startScrolling();
	}

	private async scrollDown() {
		const scrollListIsSmall =
			this.scrolly.scrollHeight < this.scrolly.clientHeight * 2;
		const scrolledToBottom =
			this.scrolly.scrollTop >=
			this.scrolly.scrollHeight - this.scrolly.clientHeight;

		this.scrolly.scroll({
			top: this.scrolly.scrollTop + this.scrolly.clientHeight,
			left: 0,
			behavior: "smooth",
		});

		this.collectUsers();

		let reachedUrlLengthMax: boolean;

		if (!this.isBlockPage) {
			this.requestUrl = `${settings.API_URL_BLOCK}?users=${this.users}`;
			reachedUrlLengthMax =
				this.requestUrl.length > settings.URL_LENGTH_MAX - 100;
		}

		if (scrolledToBottom || scrollListIsSmall || reachedUrlLengthMax) {
			console.info("finished collecting!");

			if (this.isBlockPage) {
				this.requestUrl = `${settings.API_URL_BLOCK}?users=${this.users}`;
			}

			if (this.confirmButton) {
				this.confirmButton.href = this.requestUrl;
			}

			if (this.textarea) {
				this.textarea.value = this.requestUrl;
			}

			if (this.isBlockPage && this.requestUrl.length > settings.URL_LENGTH_MAX) {
				document.querySelector("body").classList.add("many");
				let requestCount = this.requestUrl.length / settings.URL_LENGTH_MAX;
				let usersPerRequest = this.users.length / requestCount;

				for (let i = 0; i <= requestCount; i++) {
					let linkClone = this.textarea.parentNode.cloneNode(true);
					this.textarea.parentNode.parentNode.appendChild(linkClone);
					let textarea = (linkClone.childNodes.item(1) as HTMLTextAreaElement);
					let copyButton = textarea.parentElement.querySelector("button");

					copyButton.addEventListener(
						"click",
						() => {
							this.handleCopyClick(textarea, copyButton);
						},
					);

					let requestUrl = `${settings.API_URL_BLOCK}?users=${this.users.slice(
						usersPerRequest * i,
						usersPerRequest * (i + 1),
					)}`;
					textarea.value = requestUrl;
				}
			}

			const confirmHeading = this.popup.querySelector(
				".lb-confirm-message h3 span",
			);
			confirmHeading.innerHTML = `${this.users.length} ${confirmHeading.innerHTML}`;
			this.stopScrolling();
			this.popup.classList.add("lb-check");
			const checkmark = this.popup.querySelector(".lb-checkmark");

			checkmark.addEventListener(
				"transitionend",
				() => {
					this.changeStateToConfirm();
				},
			);
		}
	}

	private setUpBlockButton = async () => {
		let heading: HTMLElement;

		if (this.isLegacyTwitter) {
			heading = await tryToAccessDOM("#activity-popup-dialog-header");
			this.topbar = heading.parentElement;
			this.isLegacyTwitter = true;
		} else {
			this.topbar = await tryToAccessDOM(TOPBAR_SELECTOR[this.viewport]);
			const lastChild = this.topbar.children[this.topbar.children.length - 1];
			heading = lastChild.querySelector("div > h2 > span");
		}

		if (!this.topbar) {
			return;
		}

		const shouldDisplayOnThisPage =
			this.isBlockPage || this.isTweetPage || this.isListPage;

		if (!shouldDisplayOnThisPage) {
			return;
		}

		this.createBlockButton();
	};

	private async setUpBlockPopup() {
		const popupInner = `
			<div class='lb-label lb-collecting'>
				<h3 id="lb-popup-heading">${client.i18n.getMessage(
			"ui_collectingUsernames",
		)}... <span class="lb-user-counter"></span></h3>
				<p class="lb-text">${this.limitMessage}</p>
				<h1 class="lb-loading-wrapper"><span class='lb-loading'>...</span></h1>
			</div>`;

		this.createPopup(popupInner);
		this.createConfirmMessageElement();
		let confirmButton = this.createConfirmButton();

		if (this.isTweetPage) {
			let checkbox = this.createCheckbox();
			this.confirmMessageElement.appendChild(checkbox);
		}

		this.confirmMessageElement.appendChild(confirmButton);

		this.createCheckmark();
		this.createCloseButton();
		this.initBlockAction();
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

		if (!this.isBlockPage) {
			return;
		}

		let exportBtn = document.createElement("button");

		exportBtn.innerHTML = Icons.share;
		exportBtn.setAttribute("aria-label", client.i18n.getMessage("ui_export"));
		exportBtn.setAttribute("title", client.i18n.getMessage("ui_export"));
		exportBtn.classList.add("lb-btn--export");
		exportBtn.style.backgroundColor = this.highlightColor;

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
		const lastCharacter = likesCountText.slice(-1);

		let multiplyer = 1;
		if (lastCharacter === "K") {
			multiplyer = 1_000;
		} else if (lastCharacter === "M") {
			multiplyer = 1_000_000;
		}

		this.likesCount =
			multiplyer === 1
				? // german number format:
					parseInt(likesCountText.replace(".", ""))
				: // english number format:
					parseFloat(likesCountText) * multiplyer;
	};

	private shrinkPopupToVisibleContent() {
		const hiddenContentHeight = this.confirmMessageElement.clientHeight;
		this.popup.style.height = `${this.popup.clientHeight - hiddenContentHeight}px`;
	}

	private startScrolling() {
		this.scrollList.classList.add("lb-blur");
		this.scrolly.scrollTo(0, 0);
		this.collectedUsers = [];
		this.scrollInterval = setInterval(
			() => {
				this.scrollDown();
			},
			800,
		);
	}

	private stopScrolling = () => {
		clearInterval(this.scrollInterval);
	};
}
