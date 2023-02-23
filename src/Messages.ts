import { runtime, tabs } from "webextension-polyfill";
import { getTwitterTab } from "./Tabs";
import { User } from "./UserInfo";

enum Action {
	getUserInfo = "getUserInfo",
	queueUpdate = "queueUpdate",
	blockSpeedUpdate = "blockSpeedUpdate",
}

interface Message {
	action: Action;
}

export interface QueueUpdateData {
	queuedUser?: User;
	dequeuedUser?: User;
	queueLength: number;
	blockListLength?: number;
}

export interface QueueUpdateMessage extends Message {
	queuedUser?: User;
	dequeuedUser?: User;
	queueLength: number;
	blockListLength?: number;
}

export interface GetUserInfoMessage extends Message {
	action: Action.getUserInfo;
}

export interface GetUserInfoResponse {
	userInfo: User;
}

export default class Messenger {
	static async sendBlockSpeedUpdate() {
		const action = Action.blockSpeedUpdate;

		try {
			await runtime.sendMessage({ action });
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.", action);
		}
	}

	static async onBlockSpeedUpdate(callback: () => void) {
		runtime.onMessage.addListener((message: Message) => {
			if (message.action === Action.blockSpeedUpdate) {
				console.debug("✉ message from background", message);
				callback();
			}
		});
	}

	static async sendGetUserInfo(): Promise<GetUserInfoResponse> {
		const twitterTab = await getTwitterTab();
		const action = Action.getUserInfo;

		if (twitterTab) {
			try {
				return await tabs.sendMessage(twitterTab.id, { action });
			} catch (error) {
				console.warn("✉ Message was send but no receiver listens to it.", action);
			}
		}
	}

	static async sendQueueUpdate(data: QueueUpdateData) {
		const twitterTab = await getTwitterTab();
		const action = Action.queueUpdate;

		const messageReceivers = [runtime.sendMessage({ action, ...data })];
		if (twitterTab && twitterTab.id) {
			messageReceivers.push(tabs.sendMessage(twitterTab.id, { action, ...data }));
		}

		return Promise.all(messageReceivers).catch((error) => {
			console.info("✉ Message was send but no receiver listens to it.", action, error);
		});
	}

	static async onGetUserInfo(callback: () => Promise<GetUserInfoResponse>) {
		runtime.onMessage.addListener((message: GetUserInfoMessage) => {
			if (message.action === Action.getUserInfo) {
				console.debug("✉ message from background", message);
				return callback();
			}
		});
	}

	static async onQueueUpdate(callback: (queueUpdate: QueueUpdateData) => Promise<void>) {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			if (message.action === Action.queueUpdate) {
				console.debug("✉ message from background", message);
				const { dequeuedUser, queueLength, blockListLength } = message;
				return callback({ dequeuedUser, queueLength, blockListLength });
			}
		});
	}
}
