import { tabs } from "webextension-polyfill";

export async function getTwitterTab() {
	const activeTabs = await tabs.query({ currentWindow: true, active: true });
	const twitterTab = activeTabs.reverse().find((tab) => tab.url.includes("twitter.com"));
	console.debug("found twitterTab: ", twitterTab);
	return twitterTab;
}
