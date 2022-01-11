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
}
