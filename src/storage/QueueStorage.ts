import Messenger from "../Messages";
import settings from "../settings";
import { BlockedUser, QueuedUser, UserSet } from "../User";
import BlockListStorage from "./BlockListStorage";
import Storage, { Key } from "./Storage";

export default class QueueStorage extends Storage {
	static async getTempQueue(): Promise<UserSet<QueuedUser>> {
		const nextBatchSize = settings.DEQUEUE_BATCH_SIZE - settings.TEMP_QUEUE_BATCH_THRESHOLD;
		const queueLength = await this.getQueueLength();
		const tempQueueArray = (await this.get(Key.tempQueue)) as QueuedUser[];
		let tempQueue: UserSet<QueuedUser> = new UserSet<QueuedUser>(tempQueueArray);

		if (!tempQueue) {
			console.debug("🕍 FIRST BATCH");
			tempQueue = await this.dequeueMulti(settings.DEQUEUE_BATCH_SIZE);
			this.set(Key.tempQueue, tempQueue.toArray());
		}

		if (tempQueue.size <= settings.TEMP_QUEUE_BATCH_THRESHOLD && queueLength) {
			console.debug("🕍 NEXT BATCH");
			const nextBatch = await this.dequeueMulti(nextBatchSize);
			tempQueue.merge(nextBatch.toArray());
			this.set(Key.tempQueue, tempQueue.toArray());
			Messenger.sendNextBatch({ nextBatchFromStorage: nextBatch.toArray() });
		}

		return tempQueue;
	}

	static async dequeueFromTempQueue(): Promise<QueuedUser> {
		const tempQueue = await this.getTempQueue();
		const user = tempQueue.shift();

		if (user) {
			this.set(Key.tempQueue, tempQueue.toArray());
			this.decreaseQueueLength();
		}

		return user;
	}

	static async getQueueLength(): Promise<number> {
		let queueLength: number = await (this.get(Key.queueLength) as Promise<number>);

		if (queueLength === undefined) {
			const queue = await this.getQueue();
			queueLength = queue.size;
			this.setQueueLength(queueLength);
		}

		return queueLength;
	}

	private static async setQueueLength(queueLength: number): Promise<void> {
		this.set(Key.queueLength, queueLength);
		Messenger.sendQueueUpdate({ queueLength });
	}

	private static async increaseQueueLength(): Promise<void> {
		let queueLength: number = await this.getQueueLength();
		queueLength++;

		Messenger.sendQueueUpdate({ queueLength });

		this.setQueueLength(queueLength);
	}

	private static async decreaseQueueLength(): Promise<void> {
		let queueLength: number = await this.getQueueLength();

		if (queueLength === 0) {
			console.debug("already 0, return.");
			return;
		}

		queueLength--;

		console.debug("🔢 this.decreaseQueueLength", queueLength);
		Messenger.sendQueueUpdate({ queueLength });

		this.setQueueLength(queueLength);
	}

	private static async getQueue(): Promise<UserSet<QueuedUser>> {
		let queued = (await super.get(Key.blockingQueue)) as QueuedUser[] | undefined;

		if (!queued) {
			queued = [];
			super.set(Key.blockingQueue, queued);
		}

		return new UserSet<QueuedUser>(queued);
	}

	static async queue(user: QueuedUser) {
		const queue = await this.getQueue();
		const hasAdded = queue.add(user);

		if (hasAdded) {
			await this.increaseQueueLength();
		}

		super.set(Key.blockingQueue, queue.toArray());
	}

	/**
	 * Add multiple users to queue.
	 * @param users a UserSet of the users to be queued
	 * @returns the number of new added users
	 */
	static async queueMulti(users: QueuedUser[]): Promise<number> {
		const queue: UserSet<QueuedUser> = await this.getQueue();

		// Avoid adding already blocked accounts to queue:
		const blockedAccounts: UserSet<BlockedUser> = await BlockListStorage.getBlockedAccounts();
		const newUsers = users.filter((user) => !blockedAccounts.has(user));
		const addedUsersCount: number = queue.merge(newUsers);

		super.set(Key.blockingQueue, queue.toArray());
		this.setQueueLength(queue.size);

		return addedUsersCount;
	}

	private static async dequeueMulti(amount: number): Promise<UserSet<QueuedUser>> {
		const queue: UserSet<QueuedUser> = await this.getQueue();

		const dequeued = queue.splice(amount);
		super.set(Key.blockingQueue, queue.toArray());

		return new UserSet<QueuedUser>(dequeued);
	}

	static async queueEmpty(): Promise<boolean> {
		const queueLength = await this.getQueueLength();
		return queueLength === 0;
	}
}
