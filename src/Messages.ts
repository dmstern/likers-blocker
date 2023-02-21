import { runtime, tabs } from "webextension-polyfill";
import { getTwitterTab } from "./Tabs";
import { User } from "./UserInfo";

enum Action {
	getUserInfo = "getUserInfo",
	block = "block",
	queueUpdate = "queueUpdate",
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

export interface BlockResponse {
	blockDispatch: boolean;
}

export default class Messenger {
	static async sendBlockMessage(data: { user: User }): Promise<void | BlockResponse> {
		const twitterTab = await getTwitterTab();
		if (twitterTab) {
			await tabs.sendMessage(twitterTab.id, { action: Action.block, ...data });
		}
	}

	static async sendGetUserInfoMessage(): Promise<GetUserInfoResponse> {
		const twitterTab = await getTwitterTab();
		if (twitterTab) {
			try {
				return await tabs.sendMessage(twitterTab.id, { action: Action.getUserInfo });
			} catch (error) {
				console.error("✉ Message was send but no receiver listens to it.");
			}
		}
	}

	static async sendQueueUpdateMessage(data: QueueUpdateData) {
		try {
			await runtime.sendMessage({ action: Action.queueUpdate, ...data });
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.");
		}
	}

	static async addUserInfoListener(callback: () => Promise<GetUserInfoResponse>) {
		runtime.onMessage.addListener((message: GetUserInfoMessage) => {
			console.log("✉ message from background", message);
			if (message.action === Action.getUserInfo) {
				return callback();
			}
		});
	}

	static async addQueueUpdateListener(callback: (queueUpdate: QueueUpdateData) => Promise<void>) {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			console.log("✉ message from background", message);
			if (message.action === Action.queueUpdate) {
				const { dequeuedUser, queueLength, blockListLength } = message;
				return callback({ dequeuedUser, queueLength, blockListLength });
			}
		});
	}
}
