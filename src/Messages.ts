import { runtime, tabs } from "webextension-polyfill";
import { getTwitterTab } from "./Tabs";
import { QueuedUser, UserInfo } from "./User";

enum Action {
	getUserInfo = "getUserInfo",
	queueUpdate = "queueUpdate",
	blockSpeedUpdate = "blockSpeedUpdate",
	block = "block",
}

interface Message {
	action: Action;
}

export interface QueueUpdateData {
	queuedUser?: QueuedUser;
	dequeuedUser?: QueuedUser;
	queueLength: number;
	blockListLength?: number;
}

export interface BlockData {
	success: boolean;
	response: Response;
}

export interface QueueUpdateMessage extends Message {
	queuedUser?: QueuedUser;
	dequeuedUser?: QueuedUser;
	queueLength: number;
	blockListLength?: number;
}

export interface GetUserInfoMessage extends Message {
	action: Action.getUserInfo;
}

export interface BlockMessage extends Message {
	action: Action.block;
	success: boolean;
	response: Response;
}

export interface GetUserInfoResponse {
	userInfo: UserInfo;
}

export default class Messenger {
	static async sendBlock(data: BlockData) {
		const { success, response } = data;
		const message = { action: Action.block, success, response };

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.", message);
		}
	}

	static async sendBlockSpeedUpdate() {
		const message = { action: Action.blockSpeedUpdate };

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.", message);
		}
	}

	static async sendGetUserInfo(): Promise<GetUserInfoResponse> {
		const twitterTab = await getTwitterTab();
		const message = { action: Action.getUserInfo };

		if (twitterTab) {
			try {
				return await tabs.sendMessage(twitterTab.id, message);
			} catch (error) {
				console.warn("✉ Message was send but no receiver listens to it.", message);
			}
		}
	}

	static async sendQueueUpdate(data: QueueUpdateData) {
		const action = Action.queueUpdate;
		const message = { action, ...data };

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			console.info("✉ Message was send but no receiver listens to it.", message, error);
		}
	}

	static onBlock(callback: (data: BlockData) => void): void {
		runtime.onMessage.addListener((message: BlockMessage) => {
			if (message.action === Action.block) {
				const { success, response } = message;
				console.debug("✉ message from background", message);
				callback({ success, response });
				return true;
			}
		});
	}

	static onBlockSpeedUpdate(callback: () => void): void {
		runtime.onMessage.addListener((message: Message) => {
			if (message.action === Action.blockSpeedUpdate) {
				console.debug("✉ message from background", message);
				callback();
				return true;
			}
		});
	}

	static onGetUserInfo(callback: () => Promise<GetUserInfoResponse>): void {
		runtime.onMessage.addListener((message: GetUserInfoMessage) => {
			if (message.action === Action.getUserInfo) {
				console.debug("✉ message from background", message);
				return callback();
			}
		});
	}

	static onQueueUpdate(callback: (queueUpdate: QueueUpdateData) => void): void {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			if (message.action === Action.queueUpdate) {
				console.debug("✉ message from background", message);
				const { dequeuedUser, queueLength, blockListLength } = message;
				callback({ dequeuedUser, queueLength, blockListLength });
				return true;
			}
		});
	}
}
