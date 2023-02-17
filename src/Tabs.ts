import { tabs }from "webextension-polyfill";

export async function getTwitterTab() {
	const activeTabs = await tabs.query({ active: true, currentWindow: true });
	const twitterTab = activeTabs.find((tab) => tab.url.includes("twitter.com"));
	console.debug("found twitterTab: ", twitterTab);
	return twitterTab;
}
