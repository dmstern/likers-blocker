import { alarms, runtime, tabs } from "webextension-polyfill";
import Badge from "../Badge";
import Messenger from "../Messages";
import settings from "../settings";
import LoginStorage from "../storage/LoginStorage";
import QueueStorage from "../storage/QueueStorage";
import Storage from "../storage/Storage";
import { UserInfo } from "../User";
import Blocker from "./Blocker";
import WebRequestInterceptor from "./WebRequestInterceptor";

(function () {
	alarms.onAlarm.addListener((alarm: { name: string }) => {
		if (alarm.name === Blocker.alarmName) {
			Blocker.run();
		}
	});

	Blocker.run();
	WebRequestInterceptor.interceptTwitterRequests();
	Badge.setColor();
	QueueStorage.getQueueLength().then((queueLength) => Badge.updateBadgeCount(queueLength));

	Messenger.onQueueUpdate(({ queueLength }) => {
		Badge.updateBadgeCount(queueLength);
	});

	Messenger.onBlockSpeedUpdate(() => {
		Blocker.stop();
		Blocker.run();
	});

	Messenger.onLogin(() => {
		Blocker.run();
	});

	Messenger.onClickLogin(async () => {
		const timeToLoadTwitter = 5000;

		const twitterTab = await tabs.create({
			active: true,
			url: "https://twitter.com/login",
		});

		return new Promise<UserInfo>((resolve) => {
			setTimeout(async () => {
				const userInfoResponse = await Messenger.sendGetUserInfo(twitterTab);
				const userInfo = userInfoResponse?.userInfo;
				if (userInfo) {
					LoginStorage.login(userInfo);
					resolve(userInfo);
				}
			}, timeToLoadTwitter);
		});
	});

	runtime.onInstalled.addListener(({ reason }) => {
		if (reason === "install") {
			tabs.create({ url: settings.USAGE_URL });
		}

		if (reason === "update") {
			Storage.resetBadges();
			Storage.resetInstalledNewReleaseDate();
			tabs.create({ url: settings.RELEASE_NOTES_URL });
		}
	});
})();
