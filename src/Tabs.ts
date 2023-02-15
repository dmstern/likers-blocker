import browser from "webextension-polyfill";

export async function getTwitterTab() {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	return tabs.find((tab) => tab.url.includes("twitter.com"));
}
