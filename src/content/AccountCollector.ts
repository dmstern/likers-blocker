/* eslint-disable no-mixed-spaces-and-tabs */
import { i18n } from "webextension-polyfill";
import APIService from "../APIService";
import FileManager from "../FileManager";
import icons from "../icons";
import settings from "../settings";
import BlockListStorage from "../storage/BlockListStorage";
import OptionsStorage, { AnimationLevel } from "../storage/OptionsStorage";
import QueueStorage from "../storage/QueueStorage";
import Storage from "../storage/Storage";
import { QueuedUser, UserSet } from "../User";
import { debounce, tryToAccessDOM } from "../util";
import TextStyle from "./TextStyle";
import TwitterPage, { AccountList } from "./TwitterPage";

const TOPBAR_SELECTOR = {
	mobile: "main > div > div > div > div > div > div",
	desktop: "[aria-labelledby=modal-header] > div > div > div > div > div > div > div > div > div",
};

const BLOCKED_BUTTON_SELECTOR = "[data-testid=UserCell] [role=button]";

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
	private totalUsersCount: number;
	private confirmButton: HTMLAnchorElement | HTMLDivElement;

	private constructor() {
		this.collectedUsers = new UserSet();
		this.progressInPercent = 0;
		this.uiIdleCounter = 0;
		this.lastCollectedUserCount = [];
		this.isLegacyTwitter = document.getElementById("page-outer") !== null;
		this.getAnimationLevel().then();
		this.setUpBlockButton().then();
		this.setUpExportButton().then();
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

	private get isLegacyTwitter() {
		return this.legacyTwitter;
	}

	private set isLegacyTwitter(legacyTwitter) {
		if (legacyTwitter) {
			document.body.classList.add("lb-legacy-twitter");
		}
		this.legacyTwitter = legacyTwitter;
	}

	public static run(): void {
		// If nothing else suits:
		new AccountCollector();

		// when initially loading any twitter page:
		tryToAccessDOM(TOPBAR_SELECTOR[TwitterPage.viewport], null, null, null, 100).then(
			() => new AccountCollector()
		);

		// when initially loading the block page:
		tryToAccessDOM(BLOCKED_BUTTON_SELECTOR, null, null, null, 100).then(() => new AccountCollector());

		// For every other page: try it on click again:
		document.body.addEventListener("click", () => new AccountCollector());

		// Create a new one on resize due to changed viewport:
		window.addEventListener(
			"resize",
			debounce(() => new AccountCollector(), 250)
		);
	}

	private static async getBadgeClass(linkModifier: string): Promise<string> {
		const badgeTypes = {
			donate: await Storage.getHideBadgeDonate(),
			follow: await Storage.getHideBadgeFollow(),
			share: await Storage.getHideBadgeShare(),
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

	private async getAnimationLevel() {
		const animationLevel = await OptionsStorage.getAnimationLevel();

		document.body.classList.remove(
			"animation-level--off",
			"animation-level--mild",
			"animation-level--frisky"
		);
		document.body.classList.add(`animation-level--${animationLevel}`);

		return animationLevel;
	}

	private async getTotalUsersCount(): Promise<number> {
		const isRetweetsPage = await TwitterPage.isRetweetsPage();
		const isTweetPage = await TwitterPage.isTweetPage();
		const isListPage = await TwitterPage.isListPage();

		if (!this.totalUsersCount) {
			if (isTweetPage) {
				const tweetId = await TwitterPage.getTweetId();
				const tweet = await APIService.getTweet(tweetId);
				this.totalUsersCount = isRetweetsPage ? tweet.retweet_count : tweet.favorite_count;
			} else if (isListPage) {
				const listId = await TwitterPage.getListId();
				const list = await APIService.getList(listId);
				this.totalUsersCount =
					isListPage === AccountList.followers ? list.subscriber_count : list.member_count;
			}
		}

		// prevent multiple api calls of not successful:
		if (!this.totalUsersCount) {
			this.totalUsersCount = -1;
		}

		return this.totalUsersCount;
	}

	private async getLimitMessage() {
		if (await TwitterPage.isBlockExportPage()) {
			return `${i18n.getMessage("ui_take_a_moment")}`;
		} else {
			return `${i18n.getMessage("ui_only_list_items")}<br>${i18n.getMessage("ui_twitter_hides")}`;
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
		const avatarsWrapper = document.querySelector(".lb-truck-animation__avatars");
		avatarsWrapper?.remove();
		(await this.getScrollList()).classList.remove("lb-blur");
	}

	private async closePopup() {
		const animationLevel = await this.getAnimationLevel();
		this.popup.classList.add("lb-hide");

		if (animationLevel === AnimationLevel.off) {
			this.popup.remove();
		} else {
			this.popup.addEventListener("transitionend", () => {
				this.popup.remove();
			});
		}

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
		const isBlockPage = await TwitterPage.isBlockExportPage();
		const userCells: NodeListOf<HTMLAnchorElement> = this.isLegacyTwitter
			? (await this.getScrollList()).querySelectorAll("a.js-user-profile-link")
			: (await this.getScrollList()).querySelectorAll('[data-testid="UserCell"]');
		// Increase allowance for larger lists to avoid false-positive warnings:
		const idleCounterAllowance =
			settings.IDLE_COUNTER_ALLOWANCE + Math.floor(this.collectedUsers.size / 500);
		const totalUserCount = await this.getTotalUsersCount();
		const probablyAlmostReadyThreshold = totalUserCount < 100 ? 70 : totalUserCount < 200 ? 80 : 90;
		const animationLevel = await this.getAnimationLevel();

		const users: HTMLAnchorElement[] = Array.from(userCells);

		for (const userCell of users) {
			const userLink = userCell.querySelector('a[aria-hidden="true"]') as HTMLAnchorElement;
			const profileImg = userCell.querySelector("img") as HTMLImageElement;
			const userUrl = new URL(userLink.href);
			const profileUrl = profileImg.src;
			const userHandle = userUrl.pathname.replace("/", "");
			const user = {
				screen_name: userHandle,
				interacted_with: location.pathname,
				profile_image_url_https: profileUrl,
			};

			const wasAdded = this.collectedUsers.add(user);

			if (wasAdded && !isBlockPage && animationLevel === AnimationLevel.frisky) {
				this.renderAvatar(profileImg);
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
				progressBar.style.setProperty("--progress", this.progressInPercent.toString());
				if (this.progressInPercent > 50) {
					progressBar.classList.add("lb-progress-bar__inner--large");
				}
			}
		}

		this.lastCollectedUserCount.push(this.collectedUsers.size);
	}

	private renderAvatar(profileImg: HTMLImageElement) {
		const avatarsWrapper = document.querySelector(".lb-truck-animation__avatars");

		if (!avatarsWrapper) {
			return;
		}

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

		avatar.addEventListener("animationend", () => {
			avatar.remove();
		});
	}

	private async createBlockButton() {
		const followButton: HTMLElement = this.isLegacyTwitter
			? ((await tryToAccessDOM("button.button-text.follow-text")) as HTMLElement)
			: ((await tryToAccessDOM(
					"[role=button] [role=button]",
					false,
					1,
					await this.getScrollList()
			  )) as HTMLElement);

		// prevent multiple blockButtons:
		if (document.querySelector("[data-testid=blockAll]")) {
			return;
		}

		this.blockButton = document.createElement("a");
		const followButtonClasses = followButton instanceof HTMLElement ? followButton.classList : [];

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
			blockButtonLabel.innerHTML = i18n.getMessage("ui_block_all");
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
			<span>${i18n.getMessage("ui_block_retweeters")}</span>
		`;
		includeRetweetersLink.classList.add("lb-link");
		includeRetweetersLink.title = i18n.getMessage("ui_retweeters_hover_hint");
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

	private async createFinishButton() {
		const animationLevel = await this.getAnimationLevel();
		const finishButton = document.createElement("button") as HTMLButtonElement;
		finishButton.innerHTML = `${icons.forward}${icons.smile}`;
		finishButton.tabIndex = 0;
		finishButton.classList.add("lb-finish-button");
		finishButton.title = i18n.getMessage("ui_finish");
		finishButton.style.backgroundColor = TwitterPage.highlightColor.replace(")", ", 0.1)");
		finishButton.style.color = TwitterPage.highlightColor;
		this.popup.append(finishButton);

		finishButton.addEventListener("click", async () => {
			finishButton.classList.add("lb-finish-button--active");
			const finishButtonIcon = finishButton.querySelector("svg");

			if (!finishButtonIcon) {
				return;
			}

			const finish = async () => {
				finishButton.disabled = true;
				this.popup.classList.remove("lb-popup--has-warning");
				await this.finishCollecting();
			};

			if (animationLevel === AnimationLevel.off) {
				await finish();
			} else {
				finishButtonIcon.addEventListener("transitionend", finish, { once: true });
			}
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
					queue: "ui_add_to_queue",
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

		if (isBlockExportPage) {
			const firstOriginalBlockButton = document.querySelector("[data-testid=UserCell] [role=button]");
			this.confirmButton = document.createElement("a");
			this.confirmButton.innerHTML = firstOriginalBlockButton.innerHTML;
			this.confirmButton.classList.add(...firstOriginalBlockButton.classList);
		} else {
			this.confirmButton = this.blockButton.cloneNode(true) as HTMLAnchorElement;
		}

		this.confirmButton.classList.add("lb-confirm-button");
		this.confirmButton.classList.remove("lb-block-button");
		const confirmTitle = getLabel("confirmTitle");
		this.confirmButton.title = i18n.getMessage(confirmTitle);
		this.confirmButton.style.backgroundColor = "var(--background-color)";
		this.confirmButton.style.color = "var(--color)";
		this.popup.appendChild(this.confirmButton);

		if (!this.isLegacyTwitter && !isBlockExportPage) {
			this.confirmButton.querySelector("div > span")?.remove();
		}

		const confirmButtonLabel = this.isLegacyTwitter
			? this.confirmButton
			: (this.confirmButton.querySelector("div > span > span") as HTMLElement);

		confirmButtonLabel.innerText = i18n.getMessage(getLabel("buttonLabel"));
		const confirmButtonIcon = document.createElement("span");
		confirmButtonIcon.innerHTML = getLabel("icon");
		const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
		confirmButtonIconSvg && confirmButtonLabel?.parentElement?.append(confirmButtonIconSvg);

		if (!isBlockExportPage) {
			this.confirmButton.addEventListener("click", () => {
				this.addToQueue(confirmInfo, confirmButtonIcon, confirmButtonLabel);
				this.popup.classList.add("lb-confirmed");
			});
		}

		await this.createConfirmCloseButton(this.confirmButton);
		return areaWrapper;
	}

	private async createConfirmCloseButton(confirmButton: HTMLAnchorElement) {
		const confirmCloseButton = confirmButton.cloneNode(true) as HTMLElement;
		confirmCloseButton.classList.add("lb-confirm-button--done");
		this.popup.appendChild(confirmCloseButton);

		const confirmCloseButtonLabel = this.isLegacyTwitter
			? confirmCloseButton
			: (confirmCloseButton.querySelector("div > span > span") as HTMLElement);

		confirmCloseButtonLabel.innerText = i18n.getMessage("ui_confirm_button_label");
		const confirmCloseButtonIcon = document.createElement("span");
		confirmCloseButtonIcon.innerHTML = icons.check;
		const confirmCloseButtonIconSvg = confirmCloseButtonIcon.querySelector("svg");
		confirmCloseButtonIconSvg &&
			confirmCloseButtonLabel?.parentElement?.append(confirmCloseButtonIconSvg);
		confirmCloseButton.addEventListener("click", async () => {
			await this.closePopup();
		});
	}

	private async addToQueue(
		confirmInfo: HTMLElement,
		confirmButtonIcon: HTMLElement,
		confirmButtonLabel: HTMLElement
	) {
		const addedCount = await QueueStorage.queueMulti(this.collectedUsers.toArray());
		confirmInfo.innerHTML = `<p>${i18n.getMessage("ui_confirm_clicked", [addedCount.toString()])}</p>`;

		const confirmButtonIconSvg = confirmButtonIcon.querySelector("svg");
		confirmButtonIconSvg && confirmButtonLabel?.parentElement?.prepend(confirmButtonIconSvg);

		const addedCountLabel = document.createElement("div");
		addedCountLabel.classList.add("lb-added-count-label");
		addedCountLabel.innerHTML = `+${addedCount}`;
		this.popup.append(addedCountLabel);
	}

	private async createConfirmMessageElement() {
		const isBlockExportPage = await TwitterPage.isBlockExportPage();
		this.confirmMessageElement = this.loadingInfo?.cloneNode() as HTMLElement | null;
		if (!this.confirmMessageElement) {
			return;
		}

		Object.assign(this.confirmMessageElement.style, this.textStyle);
		this.confirmMessageElement.classList.remove("lb-collecting");
		this.confirmMessageElement.classList.add("lb-confirm-message");

		this.confirmMessageElement.innerHTML = `
			<h3>
				<span>${i18n.getMessage("ui_users_found")}</span>
				<span>${!isBlockExportPage ? i18n.getMessage("ui_confirm_message_heading_addon") : ""}</span>
			</h3>
			<div class="lb-label__main"></div>`;

		this.popup.appendChild(this.confirmMessageElement);
	}

	private async createPopup(content: string) {
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

	private async initBlockAction() {
		const popupLabel = this.popup.querySelector(".lb-label") as HTMLElement;
		Object.assign(popupLabel.style, this.textStyle);
		await this.startScrolling();
	}

	private async scrollDown(animationLevel: AnimationLevel) {
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
			behavior: animationLevel === AnimationLevel.off ? "auto" : "smooth",
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

		if (await TwitterPage.isBlockExportPage()) {
			await BlockListStorage.addBlockedMulti(this.collectedUsers.toArray());
			const blockedAccounts = await BlockListStorage.getBlockedAccounts();
			const { filename, url } = FileManager.getDownloadLinkForBlockList(blockedAccounts);
			if (this.confirmButton instanceof HTMLAnchorElement) {
				this.confirmButton.href = url;
				this.confirmButton.download = filename;
			}
		}

		// Add total found users count to heading:
		setTimeout(() => {
			const confirmHeading = this.popup.querySelector(".lb-confirm-message h3 span");
			if (confirmHeading) {
				confirmHeading.innerHTML = i18n.getMessage(
					"ui_users_found",
					this.collectedUsers.size.toLocaleString()
				);
			}
		}, 1000);

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
			heading = (await tryToAccessDOM("#activity-popup-dialog-header")) as HTMLElement;
			this.isLegacyTwitter = true;
			this.topbar = heading?.parentElement;
		} else {
			this.topbar = (await tryToAccessDOM(TOPBAR_SELECTOR[TwitterPage.viewport])) as HTMLElement;
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
					<span>${i18n.getMessage("ui_collecting_usernames")}...</span>
					<span class="lb-user-counter"></span>
				</h3>
				<p class="lb-text">${await this.getLimitMessage()}</p>
				<p class="lb-text">
					${icons.speedometer}&nbsp;
					${i18n.getMessage("ui_scroll_speed")}
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
		await this.createFinishButton();
		await this.initBlockAction();
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
							"ui_new_release"
						)}">${icons.sparkles}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__link--donate ${await AccountCollector.getBadgeClass(
						"donate"
					)}" href="https://dmstern.github.io/likers-blocker/#donate" target="_blank" title="${i18n.getMessage(
			"popup_tip"
		)}">${icons.gift}</a>
				</li>
				<li class="lb-footer__item">
					<a class="lb-footer__link lb-footer__item--report ${await AccountCollector.getBadgeClass(
						"report"
					)}" href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${i18n.getMessage(
			"popup_report_bug"
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
					case "donate": {
						Storage.setHideBadgeDonate(true);
						break;
					}
					case "follow": {
						Storage.setHideBadgeFollow(true);
						break;
					}
					case "share": {
						Storage.setHideBadgeShare(true);
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

		const blockedListContainer = (await tryToAccessDOM("section", true, 3)) as HTMLElement;

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

	private async startScrolling() {
		(await this.getScrollList()).classList.add("lb-blur");
		(await this.scrolly).scrollTo(0, 0);
		const animationLevel = await this.getAnimationLevel();
		this.collectedUsers = new UserSet();
		const scrollsPerMinute = await OptionsStorage.getScrollsPerMinute();
		const scrollInterval = Math.round((60 / scrollsPerMinute) * 1000);
		this.scrollInterval = window.setInterval(async () => {
			await this.scrollDown(animationLevel);
		}, scrollInterval);
	}

	private stopScrolling = () => {
		console.debug("stopScrolling()");
		clearInterval(this.scrollInterval);
	};

	private async createIdleWarning() {
		const animationLevel = await this.getAnimationLevel();

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
			<h4 class="lb-warning__heading">${icons.warn}<span>${i18n.getMessage("ui_warning_heading")}</span></h4>
			<span class="lb-warning__text">${i18n.getMessage("ui_warning_text")}</span>
			<div class="lb-warning__buttons">
				<button class="lb-warning__button lb-warning__button--ok">${i18n.getMessage("ui_ok")}</button>
				<button class="lb-warning__button lb-warning__button--hide">${i18n.getMessage(
					"ui_do_not_show_again"
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

				if (animationLevel === AnimationLevel.off) {
					warning.remove();
				} else {
					warning.addEventListener("transitionend", () => {
						warning.remove();
					});
				}
			});
		});

		this.popup.querySelector(".lb-warning__button--hide")?.addEventListener("click", () => {
			Storage.setHideIdleWarning(true);
		});
	}
}
