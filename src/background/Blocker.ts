import { alarms } from "webextension-polyfill";
import APIService from "../APIService";
import settings from "../settings";
import Storage from "../Storage";

const blockIntervals: NodeJS.Timeout[] = [];

export default class Blocker {
	static readonly alarmName: string = "blockTask";
	private static isRunning = false;
	private static blocksInCurrentIterationCount = 0;

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

	static stop() {
		this.clearIntervals();
		alarms.clear(Blocker.alarmName);
		this.isRunning = false;
	}

	private static clearIntervals() {
		blockIntervals.forEach((interval) => clearInterval(interval));
	}

	static async run() {
		this.clearIntervals();
		this.init();
		this.blocksInCurrentIterationCount = 0;

		console.info("⏳ starting block task...");

		const blocksPerMinute = await Storage.getBlocksPerMinute();
		const blockInterval = Math.floor((60 / blocksPerMinute) * 1000);

		blockIntervals.push(setInterval(() => this.processBlocking(blocksPerMinute), blockInterval));

		await this.processBlocking(blocksPerMinute);
	}

	private static async processBlocking(blocksPerMinute: number): Promise<number> {
		if (this.blocksInCurrentIterationCount >= blocksPerMinute) {
			this.clearIntervals();
		}

		const user = await Storage.dequeue();

		if (!user) {
			return;
		}

		APIService.block(user);
		this.blocksInCurrentIterationCount++;
	}
}
