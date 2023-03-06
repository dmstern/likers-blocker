import { i18n, notifications, runtime } from "webextension-polyfill";

export enum Notify {
	unauthenticated = "unauthenticated",
}

interface NotificationContent {
	titleKey: string;
	messageKey: string;
}

const messages: Record<Notify, NotificationContent> = {
	unauthenticated: {
		titleKey: "notification_unauthenticated_title",
		messageKey: "notification_unauthenticated_content",
	},
};

export default class Notification {
	static async push(notify: Notify) {
		const title = i18n.getMessage(messages[notify].titleKey);
		const message = i18n.getMessage(messages[notify].messageKey);

		return this.notify(title, message);
	}

	static async notify(title: string, message: string) {
		return notifications.create({
			type: "basic",
			iconUrl: runtime.getURL("icon48.png"),
			title,
			message,
		});
	}
}
