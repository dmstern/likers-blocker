import { alarms, webRequest, WebRequest } from "webextension-polyfill";
import APIService from "../APIService";
import Badge from "../Badge";
import Messenger from "../Messages";
import Storage from "../Storage";

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
			// console.debug("🔐 saving authentication token.");
			Storage.setAuthToken(value);
		}

		const re = /[0-9A-Fa-f]{160}/;
		if (name === "x-csrf-token" && re.test(value) && value.length == 160) {
			// console.debug("⚙ saving csfr");
			Storage.setCSFR(value);
		}

		if (name === "Accept-Language") {
			// console.debug("🌐 saving accepted language");
			Storage.setAcceptedLanguage(value);
		}
	}
}

async function blockTask(alarm) {
	if (alarm.name != "blockTask") {
		return;
	}

	console.info("⏳ starting block task...");

	const blockAccountsAtOnce = await Storage.getBlockAccountsAtOnce();
	const intervalBetweenBlockAccounts =
		(await Storage.getIntervalBetweenBlockAccountsInSeconds()) * 1000;

	for (let i = 0; i < blockAccountsAtOnce; i++) {
		const user = await Storage.dequeue();
		const queueLength = (await Storage.getQueue()).size;
		const blockListLength = (await Storage.getBlockedAccounts()).size;

		if (!user) {
			return;
		}

		Messenger.sendQueueUpdateMessage({
			dequeuedUser: user,
			queueLength,
			blockListLength,
		});

		APIService.block(user);

		await new Promise((r) => setTimeout(r, intervalBetweenBlockAccounts));
	}
}

function interceptTwitterRequests() {
	webRequest.onBeforeSendHeaders.addListener(logURL, { urls: ["<all_urls>"] }, ["requestHeaders"]);
}

async function createBlockAlarm() {
	alarms.create("blockTask", {
		delayInMinutes: await Storage.getBlockDelayInMinutes(),
		periodInMinutes: await Storage.getBlockPeriodInMinutes(),
	});

	alarms.onAlarm.addListener(blockTask);
}

(function () {
	createBlockAlarm();
	interceptTwitterRequests();
	Badge.setColor();
	Storage.getQueue().then((queue) => Badge.updateBadgeCount(queue.size));
	Messenger.addQueueUpdateListener(async ({ queueLength }) => {
		await Badge.updateBadgeCount(queueLength);
	});
})();
