import { alarms } from "webextension-polyfill";
import APIService from "../APIService";
import Badge from "../Badge";
import Messenger from "../Messages";
import Notification, { Notify } from "../Notification";
import settings from "../settings";
import Storage, { Key } from "../Storage";
import { QueuedUser } from "./../User";

const blockIntervals: NodeJS.Timeout[] = [];
const avatarsOnBlockMachine = 14;

export default class Blocker {
	static readonly alarmName: string = "blockTask";
	private static isRunning = false;
	private static blocksInCurrentIterationCount = 0;
	private static dequeuedUsers: QueuedUser[];

	static async run() {
		this.clearIntervals();
		this.init();
		this.blocksInCurrentIterationCount = 0;

		console.info("⏳ starting block task...");

		const blocksPerMinute = await Storage.getBlocksPerMinute();

		if (blocksPerMinute < 1) {
			return;
		}

		const blockInterval = Math.floor((60 / blocksPerMinute) * 1000);

		blockIntervals.push(setInterval(() => this.processBlocking(blocksPerMinute), blockInterval));

		const response = await this.processBlocking(blocksPerMinute);

		if (response?.status === 401) {
			await Notification.push(Notify.unauthenticated);
			Blocker.stop();
			Storage.remove(Key.userInfo);
		}
	}

	static stop() {
		this.clearIntervals();
		alarms.clear(Blocker.alarmName);
		this.isRunning = false;
	}

	static async getTempQueue(): Promise<QueuedUser[]> {
		if (!this.dequeuedUsers) {
			// tempQueue is empty, get the first batch from storage:
			this.dequeuedUsers = await Storage.dequeueMulti(settings.DEQUEUE_BATCH_SIZE);
			console.debug("🕍 NEW dequeueUsers", this.dequeuedUsers);
		} else if (this.dequeuedUsers.length < avatarsOnBlockMachine) {
			// tempQueue is getting empty, get the next batch from storage:
			const nextBatchFromStorage = await Storage.dequeueMulti(
				settings.DEQUEUE_BATCH_SIZE - avatarsOnBlockMachine
			);
			this.dequeuedUsers = this.dequeuedUsers.concat(nextBatchFromStorage);
			Messenger.sendNextBatch({ nextBatchFromStorage, newTempQueue: this.dequeuedUsers });
			console.debug("🕍 MORE dequeueUsers", this.dequeuedUsers);
		}

		return this.dequeuedUsers;
	}

	private static async init() {
		if (this.isRunning) {
			return;
		}

		alarms.create(Blocker.alarmName, {
			delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
			periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
		});

		this.isRunning = true;
	}

	private static async processBlocking(blocksPerMinute: number): Promise<Response | undefined> {
		if (this.blocksInCurrentIterationCount >= blocksPerMinute) {
			this.clearIntervals();
		}

		// remove and get the first user from tempQueue:
		const user = (await this.getTempQueue()).shift();

		if (!user) {
			return;
		}

		const response = await APIService.block(user);

		if (response.ok) {
			await Storage.decreaseQueueLength();
		}

		const queueLength = await Storage.getQueueLength();
		this.blocksInCurrentIterationCount++;
		Badge.updateBadgeCount(queueLength);
		return response;
	}

	private static clearIntervals() {
		blockIntervals.forEach((interval) => clearInterval(interval));
	}
}
