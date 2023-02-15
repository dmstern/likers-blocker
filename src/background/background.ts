import Storage, { Key } from "../Storage";
import APIService from "../APIService";
import settings from "../settings";
import Badge from "../Badge";
import browser, { WebRequest } from "webextension-polyfill";

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
			Storage.set(Key.authorization, value);
		}

		const re = /[0-9A-Fa-f]{160}/;
		if (name === "x-csrf-token" && re.test(value) && value.length == 160) {
			console.debug("⚙ saving csfr");
			Storage.set(Key.csfr, value);
		}

		if (name === "Accept-Language") {
			console.debug("🌐 saving accepted language");
			Storage.set(Key.acceptedLanguage, value);
		}
	}
}

async function blockTask(alarm) {
	if (alarm.name != "blockTask") {
		return;
	}

	console.info("⏳ starting block task...");

	for (let i = 0; i < settings.BLOCK_ACCOUNTS_AT_ONCE; i++) {

		const tabs = await browser.tabs.query({ active: true, currentWindow: true });
		for (const tab of tabs) {
			if (tab.url.includes("twitter.com")) {
				const user = await Storage.dequeue();
				if (!user) {
					return;
				}
				await browser.tabs.sendMessage(tab.id, { action: "block", user });
				break;
			}
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
