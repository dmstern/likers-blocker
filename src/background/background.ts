import Storage from "../Storage";
import Badge from "../Badge";
import { webRequest, runtime, WebRequest, tabs, alarms } from "webextension-polyfill";
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
		const twitterTab = await getTwitterTab();
		const user = await Storage.dequeue();
		const queueLength = (await Storage.getQueue()).length;
		const blockListLength = (await Storage.getBlockedAccounts()).length;

		if (!user) {
			return;
		}

		runtime
			.sendMessage({
				action: Action.queueUpdate,
				dequeuedUser: user,
				queueLength,
				blockListLength,
			})
			.catch(() => {
				console.info("✉ UpdateQueue message was send, but popup is not open. You can ignore this.");
			});

		if (twitterTab) {
			await tabs.sendMessage(twitterTab.id, { action: Action.block, user });
		}

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
})();
