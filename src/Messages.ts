import { runtime, Tabs, tabs } from "webextension-polyfill";
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
	status: number;
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
	status: number;
}

export interface GetUserInfoResponse {
	userInfo: UserInfo;
}

export default class Messenger {
	private static log(message: Message, error?: Error) {
		if (error) {
			console.info("✉ Message was send but no receiver listens to it.", message, error);
		} else {
			console.debug("✉ message from background", message);
		}
	}

	static async sendBlock(data: BlockData) {
		const { success, status } = data;
		const message = { action: Action.block, success, status };

		console.log("sendBlock Message", message);

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
		}
	}

	static async sendBlockSpeedUpdate() {
		const message = { action: Action.blockSpeedUpdate };

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
		}
	}

	static async sendGetUserInfo(twitterTab: Tabs.Tab): Promise<GetUserInfoResponse> {
		// if (!twitterTab) {
		// 	twitterTab = await getTwitterTab();
		// }

		const message = { action: Action.getUserInfo };

		if (twitterTab) {
			try {
				return tabs.sendMessage(twitterTab.id, message);
			} catch (error) {
				this.log(message, error);
			}
		}
	}

	static async sendQueueUpdate(data: QueueUpdateData) {
		const action = Action.queueUpdate;
		const message = { action, ...data };

		try {
			await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
		}
	}

	static onBlock(callback: (data: BlockData) => void): void {
		runtime.onMessage.addListener((message: BlockMessage) => {
			if (message.action === Action.block) {
				console.log("========= on block", Action.block);
				const { success, status } = message;
				this.log(message);
				callback({ success, status });
				return true;
			}
		});
	}

	static onBlockSpeedUpdate(callback: () => void): void {
		runtime.onMessage.addListener((message: Message) => {
			if (message.action === Action.blockSpeedUpdate) {
				this.log(message);
				callback();
				return true;
			}
		});
	}

	static onGetUserInfo(callback: () => Promise<GetUserInfoResponse>): void {
		runtime.onMessage.addListener((message: GetUserInfoMessage) => {
			if (message.action === Action.getUserInfo) {
				this.log(message);
				return callback();
			}
		});
	}

	static onQueueUpdate(callback: (queueUpdate: QueueUpdateData) => void): void {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			if (message.action === Action.queueUpdate) {
				this.log(message);
				const { dequeuedUser, queueLength, blockListLength } = message;
				callback({ dequeuedUser, queueLength, blockListLength });
				return true;
			}
		});
	}
}
