import { alarms } from "webextension-polyfill";
import Badge from "../Badge";
import Messenger from "../Messages";
import Storage from "../Storage";
import Blocker from "./Blocker";
import WebRequestInterceptor from "./WebRequestInterceptor";

(function () {
	alarms.onAlarm.addListener((alarm: { name: string }) => {
		if (alarm.name === Blocker.alarmName) {
			Blocker.run();
		}
	});

	Blocker.init();
	Blocker.run();
	WebRequestInterceptor.interceptTwitterRequests();
	Badge.setColor();
	Storage.getQueue().then((queue) => Badge.updateBadgeCount(queue.size));

	Messenger.onQueueUpdate(async ({ queueLength }) => {
		return Badge.updateBadgeCount(queueLength);
	});

	Messenger.onBlockSpeedUpdate(() => {
		Blocker.stop();
		Blocker.init();
		Blocker.run();
	});
})();
