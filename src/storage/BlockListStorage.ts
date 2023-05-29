import settings from "../settings";
import { BlockedUser, QueuedUser, UserSet } from "../User";
import Storage, { Key } from "./Storage";

export default class BlockListStorage extends Storage {
	static async isBlockLimitReached(): Promise<boolean> {
		const currentBlocksCount = await this.getCurrentBlocksCount();
		return currentBlocksCount >= settings.BLOCKS_PER_SESSION_LIMIT;
	}

	static async getBlockListLength(): Promise<number> {
		let blockListLength: number = await (super.get(Key.blockListLength) as Promise<number>);

		if (blockListLength === undefined) {
			blockListLength = (await this.getBlockedAccounts()).size;
		}

		return blockListLength;
	}

	static async getBlockedAccounts(): Promise<UserSet<BlockedUser>> {
		let blocked = (await super.get(Key.blockedAccounts)) as BlockedUser[] | undefined;

		if (!blocked) {
			blocked = [];
			Storage.set(Key.blockedAccounts, blocked);
		}

		return new UserSet(blocked);
	}

	static async addBlockedMulti(users: QueuedUser[]) {
		const blocked: UserSet<BlockedUser> = await this.getBlockedAccounts();
		const blockCandidates = users.map((user) => ({
			screen_name: user.screen_name,
			interacted_with: user.interacted_with,
		}));

		blocked.merge(blockCandidates);

		super.set(Key.blockListLength, blocked.size);
		super.set(Key.blockedAccounts, blocked.toArray());
	}

	static async addBlocked(user: QueuedUser) {
		const blocked = await this.getBlockedAccounts();
		const blockedUser: BlockedUser = {};

		if (user.screen_name) {
			blockedUser.screen_name = user.screen_name;
		}

		if (user.id) {
			blockedUser.id = user.id;
		}

		if (user.interacted_with) {
			blockedUser.interacted_with = user.interacted_with;
		}

		const wasAdded = blocked.add(blockedUser);
		if (wasAdded) {
			await this.increaseBlockListLength();
			await this.increaseCurrentBlocksCount();
		}

		super.set(Key.blockedAccounts, blocked.toArray());
	}

	public static async getCurrentBlocksCount(): Promise<number> {
		let currentBlocksCount: number = (await this.get(Key.currentBlocksCount)) as number;
		const lastResetDateStr: string = (await this.get(Key.lastResetDate)) as string;
		const lastResetDate: Date = new Date(lastResetDateStr);
		if (currentBlocksCount === undefined || lastResetDate.getDate() !== new Date().getDate()) {
			this.resetCurrentBlocksCount();
			currentBlocksCount = 0;
		}

		return currentBlocksCount;
	}

	static resetCurrentBlocksCount() {
		this.set(Key.lastResetDate, new Date().toString());
		this.set(Key.currentBlocksCount, 0);
	}

	private static async increaseBlockListLength(): Promise<void> {
		let blockListLength: number = await this.getBlockListLength();
		blockListLength++;
		super.set(Key.blockListLength, blockListLength);
	}

	private static async increaseCurrentBlocksCount(): Promise<void> {
		let currentBlocksCount: number = await this.getCurrentBlocksCount();
		currentBlocksCount++;
		super.set(Key.currentBlocksCount, currentBlocksCount);
	}
}
