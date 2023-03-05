import { alarms } from "webextension-polyfill";
import APIServiceMock from "../APIServiceMock";
import Badge from "../Badge";
import Notification, { Notify } from "../Notification";
import settings from "../settings";
import LoginStorage from "../storage/LoginStorage";
import OptionsStorage from "../storage/OptionsStorage";
import QueueStorage from "../storage/QueueStorage";

const blockIntervals: NodeJS.Timeout[] = [];

export default class Blocker {
	static readonly alarmName: string = "blockTask";
	private static isRunning = false;
	private static blocksInCurrentIterationCount = 0;

	static async run() {
		this.clearIntervals();
		const blocksPerMinute = await OptionsStorage.getBlocksPerMinute();
		if (blocksPerMinute < 1) {
			return;
		}

		this.init();
		this.blocksInCurrentIterationCount = 0;

		console.info("⏳ starting block task...");

		const blockInterval = Math.floor((60 / blocksPerMinute) * 1000);
		blockIntervals.push(setInterval(() => this.processBlocking(blocksPerMinute), blockInterval));

		// Start blocking also immediately:
		this.processBlocking(blocksPerMinute);
	}

	static stop() {
		this.clearIntervals();
		alarms.clear(Blocker.alarmName);
		this.isRunning = false;
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

	private static async processBlocking(blocksPerMinute: number) {
		if (this.blocksInCurrentIterationCount >= blocksPerMinute) {
			this.clearIntervals();
		}

		// remove and get the first user from tempQueue:
		const user = await QueueStorage.dequeueFromTempQueue();

		if (!user) {
			return;
		}

		// const response = await APIService.block(user);
		const response = await APIServiceMock.block(user);

		if (response?.status === 401) {
			await Notification.push(Notify.unauthenticated);
			Blocker.stop();
			LoginStorage.logout();
		}

		const queueLength = await QueueStorage.getQueueLength();
		this.blocksInCurrentIterationCount++;
		Badge.updateBadgeCount(queueLength);
	}

	private static clearIntervals() {
		blockIntervals.forEach((interval) => clearInterval(interval));
	}
}
