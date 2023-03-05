import { BlockedUser, QueuedUser, UserSet } from "../User";
import Storage, { Key } from "./Storage";

export default class BlockListStorage extends Storage {
	static async getBlockListLength(): Promise<number> {
		let blockListLength: number = await (super.get(Key.blockListLength) as Promise<number>);

		if (blockListLength === undefined) {
			blockListLength = (await this.getBlockedAccounts()).size;
		}

		return blockListLength;
	}

	private static async increaseBlockListLength(): Promise<void> {
		let blockListLength: number = await this.getBlockListLength();
		blockListLength++;
		super.set(Key.blockListLength, blockListLength);
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
		}

		super.set(Key.blockedAccounts, blocked.toArray());
	}
}
