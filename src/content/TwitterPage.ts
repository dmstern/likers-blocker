import TextStyle from "./TextStyle";

export default class TwitterPage {
	static get backgroundColor() {
		return getComputedStyle(document.body).backgroundColor;
	}

	static get twitterBrandColor() {
		return "#1A8CD8";
	}

	static get highlightColor() {
		const composeButton = document.querySelector("a[href='/compose/tweet']");
		return composeButton ? getComputedStyle(composeButton).backgroundColor : this.twitterBrandColor;
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

	static getTextStyle(isLegacyTwitter: boolean): TextStyle {
		let textElement: HTMLElement | null;

		if (isLegacyTwitter) {
			textElement = document.querySelector(".js-tweet-text");
		} else {
			const bioText: HTMLElement | null = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
			);
			const nameText: HTMLElement | null = document.querySelector(
				"[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
			);
			textElement = bioText || nameText;
		}

		if (!textElement) {
			textElement = document.querySelector("span");
		}

		const textElementStyle = textElement ? getComputedStyle(textElement) : new CSSStyleDeclaration();
		return new TextStyle(textElementStyle);
	}

	static isTweetPage(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				const isLikesOrRetweets = (await this.isLikesPage()) || (await this.isRetweetsPage());
				const isTweetPage = location.pathname.includes("status") && isLikesOrRetweets;
				resolve(isTweetPage);
			}, 1);
		});
	}

	static async getTweetId(): Promise<string> {
		const isTweetPage = await this.isTweetPage();
		const parts = location.href.split("/");
		const lastPart = parts.at(-1);
		const endsWithNumber = /\d/.test(lastPart);
		const isTweetBasePage = location.pathname.includes("status") && endsWithNumber;

		let tweetId: string;

		if (isTweetBasePage) {
			tweetId = lastPart;
		}

		if (isTweetPage) {
			tweetId = parts.at(-2);
		}

		return tweetId;
	}

	static async getListId(): Promise<string> {
		const isTweetPage = await this.isListPage();
		const parts = location.href.split("/");
		const lastPart = parts.at(-1);
		const endsWithNumber = /\d/.test(lastPart);
		const isTweetBasePage = location.pathname.includes("status") && endsWithNumber;

		let tweetId: string;

		if (isTweetBasePage) {
			tweetId = lastPart;
		}

		if (isTweetPage) {
			tweetId = parts.at(-2);
		}

		return tweetId;
	}

	static isLikesPage(): Promise<boolean> {
		const isLikesPage = location.pathname.endsWith("likes");
		document.body.classList.toggle("lb-likes-page", isLikesPage);
		return new Promise((resolve) => resolve(isLikesPage));
	}

	static isRetweetsPage(): Promise<boolean> {
		const isLikesPage = location.pathname.endsWith("retweets");
		document.body.classList.toggle("lb-retweets-page", isLikesPage);
		return new Promise((resolve) => resolve(location.pathname.endsWith("retweets")));
	}

	static async isBlockExportPage(): Promise<boolean> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const isBlockPage =
					location.href.endsWith("blocked/all") ||
					location.href.endsWith("settings/content_preferences") ||
					location.href.endsWith("settings/mute_and_block");

				document.querySelector("body")?.classList.toggle("lb-block-page", isBlockPage);

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
