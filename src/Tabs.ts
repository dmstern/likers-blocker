import browser from "webextension-polyfill";

export async function getTwitterTab() {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	const twitterTab = tabs.find((tab) => tab.url.includes("twitter.com"));
	console.debug("found twitterTab: ", twitterTab);
	return twitterTab;
}
