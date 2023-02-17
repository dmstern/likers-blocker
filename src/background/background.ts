import Storage from "../Storage";
import settings from "../settings";
import Badge from "../Badge";
import browser, { WebRequest } from "webextension-polyfill";
import { Action } from "../Messages";
import { getTwitterTab } from "../Tabs";

function logURL(details: WebRequest.OnBeforeSendHeadersDetailsType): void {
	if (!details.requestHeaders) {
		return;
	}

	for (const header of details.requestHeaders) {
		const { name, value } = header;

		if (!value) {
			continue;
		}

		if (name === "authorization" && value.includes("Bearer")) {
			console.debug("🔐 saving authentication token.");
			Storage.setAuthToken(value);
		}

		const re = /[0-9A-Fa-f]{160}/;
		if (name === "x-csrf-token" && re.test(value) && value.length == 160) {
			console.debug("⚙ saving csfr");
			Storage.setCSFR(value);
		}

		if (name === "Accept-Language") {
			console.debug("🌐 saving accepted language");
			Storage.setAcceptedLanguage(value);
		}
	}
}

async function blockTask(alarm) {
	if (alarm.name != "blockTask") {
		return;
	}

	console.info("⏳ starting block task...");

	for (let i = 0; i < settings.BLOCK_ACCOUNTS_AT_ONCE; i++) {
		const twitterTab = await getTwitterTab();
		const user = await Storage.dequeue();

		if (!user) {
			return;
		}

		if (twitterTab) {
			await browser.tabs.sendMessage(twitterTab.id, { action: Action.block, user });
		}

		await new Promise((r) => setTimeout(r, 2000));
	}
}

browser.webRequest.onBeforeSendHeaders.addListener(logURL, { urls: ["<all_urls>"] }, [
	"requestHeaders",
]);

browser.alarms.create("blockTask", {
	delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
	periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
});

browser.alarms.onAlarm.addListener(blockTask);

(function () {
	setTimeout(() => {
		console.log("starting background.js");
		Storage.getQueue().then((queue) => Badge.updateBadgeCount(queue.length));
		Badge.setColor();
	}, 5000);
})();
