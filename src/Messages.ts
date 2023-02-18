import { runtime, tabs } from "webextension-polyfill";
import { getTwitterTab } from "./Tabs";
import { UserInfo } from "./UserInfo";

enum Action {
	getUserInfo = "getUserInfo",
	block = "block",
	queueUpdate = "queueUpdate",
}

interface Message {
	action: Action;
}

export interface QueueUpdateData {
	dequeuedUser: UserInfo;
	queueLength: number;
	blockListLength: number;
}

export interface QueueUpdateMessage extends Message {
	dequeuedUser: UserInfo;
	queueLength: number;
	blockListLength: number;
}

export interface GetUserInfoMessage extends Message {
	action: Action.getUserInfo;
}

export interface BlockMessage extends Message {
	user: UserInfo;
}

export interface GetUserInfoResponse {
	userInfo: UserInfo;
}

export interface BlockResponse {
	blockDispatch: boolean;
}

export default class Messenger {
	static async sendBlockMessage(data: { user: UserInfo }): Promise<void | BlockResponse> {
		const twitterTab = await getTwitterTab();
		if (twitterTab) {
			await tabs.sendMessage(twitterTab.id, { action: Action.block, ...data });
		}
	}

	static async sendGetUserInfoMessage(): Promise<GetUserInfoResponse> {
		const twitterTab = await getTwitterTab();
		if (twitterTab) {
			return await tabs.sendMessage(twitterTab.id, { action: Action.getUserInfo });
		}
	}

	static async sendQueueUpdateMessage(data: QueueUpdateData) {
		try {
			await runtime.sendMessage({ action: Action.queueUpdate, ...data });
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.");
		}
	}

	static async addBlockListener(callback: (user: UserInfo) => Promise<BlockResponse>) {
		runtime.onMessage.addListener((message: BlockMessage) => {
			console.log("✉ message from background", message);
			if (message.action === Action.block) {
				return callback(message.user);
			}
		});
	}

	static async addUserInfoListener(callback: () => Promise<GetUserInfoResponse>) {
		runtime.onMessage.addListener((message: GetUserInfoMessage) => {
			console.log("✉ message from background", message);
			if (message.action === Action.getUserInfo) {
				return callback();
			}
		});
	}

	static async addQueueUpdateListener(callback: () => Promise<void>) {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			console.log("✉ message from background", message);
			if (message.action === Action.queueUpdate) {
				return callback();
			}
		});
	}
}
