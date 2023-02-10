import TextStyle from "./TextStyle";

export default class TwitterPage {
	static get backgroundColor() {
		return getComputedStyle(document.querySelector("body")).backgroundColor;
	}

	static get twitterBrandColor() {
		return window.getComputedStyle(document.querySelector("a[href='/home'] svg")).color;
	}

	static get highlightColor() {
		return getComputedStyle(document.querySelector("a[href='/compose/tweet']")).backgroundColor;
	}

	static get popupContainer(): HTMLElement {
		const modalDialog = document.querySelector("[aria-modal=true]") as HTMLElement;
		return modalDialog || (document.querySelector("body") as HTMLElement);
	}

	static get isMobile(): boolean {
		return document.documentElement.clientWidth < 699;
	}

	static get viewport() {
		return this.isMobile ? "mobile" : "desktop";
	}

	static getTextStyle(isLegacyTwitter): TextStyle {
		let textElement: HTMLElement;
		let style: TextStyle;
		let textElementStyle: CSSStyleDeclaration;

		if (isLegacyTwitter) {
			textElement = document.querySelector(".js-tweet-text");
		} else {
			const bioText: HTMLElement = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
			);
			const nameText: HTMLElement = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
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

	static isTweetPage(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			setTimeout(() => {
				resolve(location.pathname.includes("status") && location.pathname.endsWith("likes"));
			}, 1);
		});
	}

	static async isBlockPage(): Promise<boolean> {
		return new Promise((resolve) => {
			setTimeout(() => {
				let isBlockPage =
					location.href.endsWith("blocked/all") ||
					location.href.endsWith("settings/content_preferences") ||
					location.href.endsWith("settings/mute_and_block");

				document.querySelector("body").classList[`${isBlockPage ? "add" : "remove"}`]("lb-block-page");

				resolve(isBlockPage);
			}, 1);
		});
	}

	static async isListPage(): Promise<AccountList | boolean> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const pathParts = location.href.split("/");
				const lastPathPart = pathParts[pathParts.length - 1];

				if (
					location.href.includes("list") &&
					(location.href.endsWith(AccountList.followers) || location.href.endsWith(AccountList.members))
				) {
					resolve(AccountList[lastPathPart]);
				}

				return resolve(false);
			}, 1);
		});
	}
}

export enum AccountList {
	members = "members",
	followers = "followers",
}
