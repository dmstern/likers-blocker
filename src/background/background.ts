import { alarms, tabs } from "webextension-polyfill";
import Badge from "../Badge";
import Messenger from "../Messages";
import Storage from "../Storage";
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
	Storage.getQueueLength().then((queueLength) => Badge.updateBadgeCount(queueLength));

	Messenger.onQueueUpdate(({ queueLength }) => {
		Badge.updateBadgeCount(queueLength);
	});

	Messenger.onBlockSpeedUpdate(() => {
		Blocker.stop();
		Blocker.run();
	});

	Messenger.onLogin(async () => {
		const timeToLoadTwitter = 4000;

		const twitterTab = await tabs.create({
			active: true,
			url: "https://twitter.com/login",
		});

		return new Promise<UserInfo>((resolve) => {
			setTimeout(async () => {
				const userInfoResponse = await Messenger.sendGetUserInfo(twitterTab);
				const userInfo = userInfoResponse?.userInfo;
				if (userInfo) {
					Storage.setUserInfo(userInfo);
					resolve(userInfo);
				}
			}, timeToLoadTwitter);
		});
	});
})();
