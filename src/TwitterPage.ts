export default class TwitterPage {
	static get backgroundColor() {
		return getComputedStyle(document.querySelector("body")).backgroundColor;
	}

	static get highlightColor() {
		return window.getComputedStyle(
			document.querySelector("a[href='/home'] svg"),
		).color;
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

	static get isListPage(): boolean {
		return (
			location.href.includes("list") &&
			(location.href.endsWith("members") ||
				location.href.endsWith("subscribers"))
		);
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
