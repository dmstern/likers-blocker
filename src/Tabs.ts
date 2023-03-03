import { tabs } from "webextension-polyfill";

export async function getTwitterTab(active = true) {
	const activeTabs = await tabs.query({ currentWindow: true, active });
	const twitterTab = activeTabs.reverse().find((tab) => tab.url.includes("twitter.com"));
	console.debug("found twitterTab: ", twitterTab);
	return twitterTab;
}
