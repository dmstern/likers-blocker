import { runtime, Tabs, tabs } from "webextension-polyfill";
import { getTwitterTab } from "./Tabs";
import { QueuedUser, UserInfo } from "./User";

enum Action {
	getUserInfo = "getUserInfo",
	queueUpdate = "queueUpdate",
	blockSpeedUpdate = "blockSpeedUpdate",
	block = "block",
	login = "login",
	getTempQueue = "getTempQueue",
	nextBatch = "nextBatch",
}

interface Message {
	action: Action;
}

export interface QueueUpdateData {
	queueLength: number;
	blockListLength?: number;
}

export interface BlockData {
	success: boolean;
	status: number;
}

export interface NextBatchData {
	nextBatchFromStorage: QueuedUser[];
	newTempQueue: QueuedUser[];
}

export interface QueueUpdateMessage extends Message {
	queueLength: number;
	blockListLength?: number;
}

export interface GetUserInfoMessage extends Message {
	action: Action.getUserInfo;
}

export interface GetTempQueueMessage extends Message {
	action: Action.getTempQueue;
}

export interface NextBatchMessage extends Message {
	action: Action.nextBatch;
	newTempQueue: QueuedUser[];
	nextBatchFromStorage: QueuedUser[];
}

export interface LoginMessage extends Message {
	action: Action.login;
}

export interface BlockMessage extends Message {
	action: Action.block;
	success: boolean;
	status: number;
}

export interface GetUserInfoResponse {
	userInfo: UserInfo;
}

export type GetTempQueueResponse = QueuedUser[];

export default class Messenger {
	private static log(message: Message, error?: Error) {
		if (error) {
			console.info("✉ Message was send but no receiver listens to it.", message, error);
		} else {
			console.debug("✉ message from background", message);
		}
	}

	static async sendGetTempQueue(): Promise<QueuedUser[]> {
		const message: GetTempQueueMessage = { action: Action.getTempQueue };

		try {
			return await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
		}
	}

	static async sendNextBatch(data: NextBatchData) {
		const { newTempQueue, nextBatchFromStorage } = data;
		const message: NextBatchMessage = { action: Action.nextBatch, newTempQueue, nextBatchFromStorage };

		try {
			return await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
		}
	}

	static async sendBlock(data: BlockData) {
		const { success, status } = data;
		const message = { action: Action.block, success, status };

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

	static async sendGetUserInfo(twitterTab?: Tabs.Tab): Promise<GetUserInfoResponse> {
		if (!twitterTab) {
			twitterTab = await getTwitterTab();
		}

		const message = { action: Action.getUserInfo };

		if (twitterTab) {
			try {
				return tabs.sendMessage(twitterTab.id, message);
			} catch (error) {
				this.log(message, error);
			}
		}
	}

	static async sendLogin(): Promise<UserInfo> {
		const message = { action: Action.login };

		try {
			return await runtime.sendMessage(message);
		} catch (error) {
			this.log(message, error);
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

	static onGetTempQueue(callback: () => Promise<GetTempQueueResponse>): void {
		runtime.onMessage.addListener((message: GetTempQueueMessage) => {
			if (message.action === Action.getTempQueue) {
				this.log(message);
				return callback();
			}
		});
	}

	static onNextBatch(
		callback: (response: { newTempQueue: QueuedUser[]; nextBatchFromStorage: QueuedUser[] }) => void
	): void {
		runtime.onMessage.addListener((message: NextBatchMessage) => {
			if (message.action === Action.nextBatch) {
				const { newTempQueue, nextBatchFromStorage } = message;
				this.log(message);
				callback({ newTempQueue, nextBatchFromStorage });
				return true;
			}
		});
	}

	static onBlock(callback: (data: BlockData) => Promise<void>): void {
		runtime.onMessage.addListener((message: BlockMessage) => {
			if (message.action === Action.block) {
				const { success, status } = message;
				this.log(message);
				return callback({ success, status });
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

	static onLogin(callback: () => Promise<UserInfo>): void {
		runtime.onMessage.addListener((message: LoginMessage) => {
			if (message.action === Action.login) {
				this.log(message);
				return callback();
			}
		});
	}

	static onQueueUpdate(callback: (queueUpdate: QueueUpdateData) => void): void {
		runtime.onMessage.addListener((message: QueueUpdateMessage) => {
			if (message.action === Action.queueUpdate) {
				this.log(message);
				const { queueLength } = message;
				callback({ queueLength });
				return true;
			}
		});
	}
}
