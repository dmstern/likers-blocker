import { alarms, i18n } from "webextension-polyfill";
import APIService from "../APIService";
import APIServiceMock from "../APIServiceMock";
import Badge from "../Badge";
import Notification, { Notify } from "../Notification";
import settings from "../settings";
import BlockListStorage from "../storage/BlockListStorage";
import LoginStorage from "../storage/LoginStorage";
import OptionsStorage from "../storage/OptionsStorage";
import QueueStorage from "../storage/QueueStorage";
import Storage from "../storage/Storage";

const blockIntervals: NodeJS.Timeout[] = [];

export default class Blocker {
	static readonly alarmName: string = "blockTask";
	static readonly heartbeatName: string = "blockTaskHeartbeat";
	private static blocksInCurrentIterationCount = 0;

	static async isRunning() {
		return await Storage.isBlockerRunning();
	}

	static setRunning(isRunning: boolean) {
		Storage.setBlockerRunning(isRunning);
	}

	static async heartbeat() {
		const isRunning = await this.isRunning();
		const reachedLimit = await BlockListStorage.isBlockLimitReached();
		//check logged in
		const isLoggedIn = await LoginStorage.isLoggedIn();
		if (!isRunning && !reachedLimit && isLoggedIn) {
			this.run();
		}
	}

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
		this.setRunning(false);
	}

	private static async init() {
		if (await this.isRunning()) {
			return;
		}

		alarms.create(Blocker.alarmName, {
			delayInMinutes: settings.BLOCK_DELAY_IN_MINUTES,
			periodInMinutes: settings.BLOCK_PERIOD_IN_MINUTES,
		});

		alarms.create(Blocker.heartbeatName, {
			delayInMinutes: 0,
			periodInMinutes: 15,
		});

		this.setRunning(true);
	}

	private static async processBlocking(blocksPerMinute: number) {
		const reachedLimit = await BlockListStorage.isBlockLimitReached();
		const isLoggedIn = await LoginStorage.isLoggedIn();
		if (reachedLimit || !isLoggedIn) {
			this.stop();
			await Notification.notify(
				i18n.getMessage("notification_reached_limit_title"),
				i18n.getMessage(
					"notification_reached_limit_content",
					settings.BLOCKS_PER_SESSION_LIMIT.toString()
				)
			);
			return;
		}

		if (this.blocksInCurrentIterationCount >= blocksPerMinute) {
			this.clearIntervals();
		}

		// remove and get the first user from tempQueue:
		const user = await QueueStorage.dequeueFromTempQueue();

		if (!user) {
			return;
		}

		const useMock = await Storage.getUseMock();
		const response = useMock ? await APIServiceMock.block(user) : await APIService.block(user);

		if (response?.status === 401) {
			await Notification.push(Notify.unauthenticated);
			this.stop();
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
