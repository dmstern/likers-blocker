import TextStyle from "./TextStyle";

export default class TwitterPage {
	static get backgroundColor() {
		return getComputedStyle(document.querySelector("body")).backgroundColor;
	}

	static get highlightColor() {
		return window.getComputedStyle(
			document.querySelector("a[href='/home'] svg"),
		).color;
	}

	static get twitterBrandColor() {
		return getComputedStyle(document.querySelector("a[href='/compose/tweet']")).backgroundColor;
	}

	static get isBlockPage(): boolean {
		let isBlockPage =
			location.href.endsWith("blocked/all") ||
			location.href.endsWith("settings/content_preferences");

		document.querySelector("body").classList[`${isBlockPage ? "add" : "remove"}`](
			"lb-block-page",
		);

		return isBlockPage;
	}

	static getTextStyle(isLegacyTwitter): TextStyle {
		let textElement: HTMLElement;
		let style: TextStyle;
		let textElementStyle: CSSStyleDeclaration;

		if (isLegacyTwitter) {
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

	static get isListPage(): boolean | ListAccounts {
		const pathParts = location.href.split("/");
		const lastPathPart = pathParts[pathParts.length - 1];

		if (location.href.includes("list") &&
			(location.href.endsWith(ListAccounts.followers) || location.href.endsWith(ListAccounts.members))) {
			return ListAccounts[lastPathPart];
		}

		return false;
	}

	static get isTweetPage(): boolean {
		return location.href.includes("status");
	}

	static get popupContainer(): HTMLElement {
		const modalDialog = (document.querySelector("[aria-modal=true]") as HTMLElement);
		return modalDialog || (document.querySelector("body") as HTMLElement);
	}

	static get isMobile(): boolean {
		return document.documentElement.clientWidth < 699;
	}

	static get viewport() {
		return this.isMobile ? "mobile" : "desktop";
	}
}

enum ListAccounts {
	members = "members",
	followers = "followers",
}
