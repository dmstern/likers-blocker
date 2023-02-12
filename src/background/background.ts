import Storage, { Key } from "../Storage";
import APIService from "../APIService";
import settings from "../settings";

const client = typeof browser === "undefined" ? chrome : browser;

function logURL(e) {
	for (const header of e.requestHeaders) {
		if ((header.name = "authorization") && header.value.includes("Bearer")) {
			console.info("🔐 saving authentication token.");
			Storage.set(Key.authorization, header.value);
		}
		const re = /[0-9A-Fa-f]{160}/;
		if ((header.name = "x-csrf-token") && re.test(header.value) && header.value.length == 160) {
			console.log("⚙ saving csfr");
			Storage.set(Key.csfr, header.value);
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
		await new Promise(r => setTimeout(r, 2000));
	}

	const queue = await Storage.getQueue();
	browser.browserAction.setBadgeText({ text: queue.length.toString() });
}

client.webRequest.onBeforeSendHeaders.addListener(logURL, { urls: ["<all_urls>"] }, ["requestHeaders"]);

client.alarms.create("blockTask", {
	delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
	periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
});

client.alarms.onAlarm.addListener(blockTask);
