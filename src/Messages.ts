import { UserInfo } from "./UserInfo";

export enum Action {
	getUserInfo = "getUserInfo",
	block = "block",
	queueUpdate = "queueUpdate",
}

interface Message {
	action: Action;
}

export interface QueueUpdateMessage extends Message {
	action: Action.queueUpdate;
	dequeuedUser: string;
	queueLength: number;
	blockListLength: number;
}

export interface GetUserInfoMessage extends Message {
	action: Action.getUserInfo;
	userInfo: UserInfo;
}

export interface BlockMessage extends Message {
	action: Action.block;
	blockDispatch: boolean;
}
