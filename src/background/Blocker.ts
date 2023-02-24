import { alarms } from "webextension-polyfill";
import APIService from "../APIService";
import Badge from "../Badge";
import settings from "../settings";
import Storage from "../Storage";

const blockIntervals: NodeJS.Timeout[] = [];

export default class Blocker {
	static readonly alarmName: string = "blockTask";
	private static isRunning = false;
	private static blocksInCurrentIterationCount = 0;

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

		await this.processBlocking(blocksPerMinute);
	}

	static stop() {
		this.clearIntervals();
		alarms.clear(Blocker.alarmName);
		this.isRunning = false;
	}

	private static init() {
		if (this.isRunning) {
			return;
		}

		alarms.create(Blocker.alarmName, {
			delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
			periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
		});

		this.isRunning = true;
	}

	private static async processBlocking(blocksPerMinute: number): Promise<number> {
		if (this.blocksInCurrentIterationCount >= blocksPerMinute) {
			this.clearIntervals();
		}

		const user = await Storage.dequeue();

		if (!user) {
			return;
		}

		await APIService.block(user);
		const queue = await Storage.getQueue();
		this.blocksInCurrentIterationCount++;
		Badge.updateBadgeCount(queue.size);
	}

	private static clearIntervals() {
		blockIntervals.forEach((interval) => clearInterval(interval));
	}
}
