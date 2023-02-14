import Storage, { Key } from "../Storage";
import APIService from "../APIService";
import settings from "../settings";
import Badge from "../Badge";

const client = typeof browser === "undefined" ? chrome : browser;

function logURL(
	details: chrome.webRequest.WebRequestHeadersDetails | browser.webRequest._OnBeforeSendHeadersDetails
): void {
	for (const header of details.requestHeaders) {
		if (header.name === "authorization" && header.value.includes("Bearer")) {
			console.debug("🔐 saving authentication token.");
			Storage.set(Key.authorization, header.value);
		}

		const re = /[0-9A-Fa-f]{160}/;
		if (header.name === "x-csrf-token" && re.test(header.value) && header.value.length == 160) {
			console.debug("⚙ saving csfr");
			Storage.set(Key.csfr, header.value);
		}

		if (header.name === "Accept-Language") {
			console.debug("🌐 saving accepted language");
			Storage.set(Key.acceptedLanguage, header.value);
		}
	}
}

async function blockTask(alarm) {
	if (alarm.name != "blockTask") {
		return;
	}

	console.info("⏳ starting block task...");

	for (let i = 0; i < settings.BLOCK_ACCOUNTS_AT_ONCE; i++) {
		const user = await Storage.dequeue();

		if (!user) {
			return;
		}

		const response = await APIService.block(user);

		if (response.status != 200) {
			Storage.queue(user);
		}
		await new Promise((r) => setTimeout(r, 2000));
	}
}

client.webRequest.onBeforeSendHeaders.addListener(logURL, { urls: ["<all_urls>"] }, ["requestHeaders"]);

client.alarms.create("blockTask", {
	delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
	periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
});

client.alarms.onAlarm.addListener(blockTask);

Badge.updateBadgeCount();
