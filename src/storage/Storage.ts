import { storage } from "webextension-polyfill";
import Cookies from "../Cookies";
import { BlockedUser, QueuedUser, UserInfo } from "../User";

const date = new Date();

export enum Key {
	hideBadgeShare = "hideBadgeShare",
	hideBadgeDonate = "hideBadgeDonate",
	hideBadgeFollow = "hideBadgeFollow",
	hideIdleWarning = "hideIdleWarning",
	installedNewReleaseDate = "installedNewReleaseDate",
	blockedAdsCounts = "blockedAdsCounts",
	acceptedLanguage = "login.acceptedLanguage",
	userId = "login.userId",
	authorization = "login.authorization",
	csfr = "login.csfr",
	userInfo = "login.userInfo",
	lang = "login.lang",
	blockingQueue = "queue.blockingQueue",
	tempQueue = "queue.tempQueue",
	queueLength = "queue.queueLength",
	blockedAccounts = "blocklist.blockedAccounts",
	blockListLength = "blocklist.blockListLength",
	currentBlocksCount = "blocklist.currentBlocksCount",
	blocksPerMinute = "options.blocksPerMinute",
	scrollsPerMinute = "options.scrollsPerMinute",
	adBlockerActive = "options.adBlockerActive",
	animationLevel = "options.animationLevel",
	blockerRunning = "blockerRunning",
	screenshotMode = "screenshotMode",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

type StorageValue = boolean | number | string | UserInfo | UserInfo[] | BlockedUser[] | QueuedUser[];

export default class Storage {
	static async getIdentity(): Promise<string> {
		const idFromCookies = await Cookies.getIdentity();
		const idFromStorage = (await this.get(Key.userId, false)) as string;
		let identity = idFromStorage;

		if (idFromCookies && idFromCookies !== idFromStorage) {
			identity = idFromCookies;
			Storage.set(Key.userId, idFromCookies, false);
		}

		return new Promise<string>((resolve) => resolve(identity));
	}

	static async getScreenshotMode(): Promise<boolean> {
		const isScreenshotMode = (await this.get(Key.screenshotMode, false)) as Promise<boolean>;
		if (isScreenshotMode === undefined) {
			this.set(Key.screenshotMode, false, false);
		}
		return !!isScreenshotMode;
	}

	static async setIdentity(userId: string) {
		this.set(Key.userId, userId, false);
	}

	static async getHideBadgeShare(): Promise<boolean> {
		return this.get(Key.hideBadgeShare, false) as Promise<boolean>;
	}

	static setHideBadgeShare(value: boolean) {
		this.set(Key.hideBadgeShare, value, false);
	}

	static async getHideBadgeDonate(): Promise<boolean> {
		return this.get(Key.hideBadgeDonate, false) as Promise<boolean>;
	}

	static setHideBadgeDonate(value: boolean) {
		this.set(Key.hideBadgeDonate, value, false);
	}

	static async getHideBadgeFollow(): Promise<boolean> {
		return this.get(Key.hideBadgeFollow, false) as Promise<boolean>;
	}

	static setHideBadgeFollow(value: boolean) {
		this.set(Key.hideBadgeFollow, value, false);
	}

	static async getHideIdleWarning(): Promise<boolean> {
		return this.get(Key.hideIdleWarning, false) as Promise<boolean>;
	}

	static setHideIdleWarning(value: boolean) {
		this.set(Key.hideIdleWarning, value, false);
	}

	static async getInstalledNewReleaseDate(): Promise<number> {
		const value = await this.get(Key.installedNewReleaseDate, false);
		const dateFromStorage = parseInt(value[Key.installedNewReleaseDate]);
		return Number.isNaN(dateFromStorage) ? values.today : dateFromStorage;
	}

	static resetInstalledNewReleaseDate() {
		this.set(Key.installedNewReleaseDate, values.today, false);
	}

	static async getIsNewRelease(): Promise<boolean> {
		const value = await this.getInstalledNewReleaseDate();
		return values.today < value + 3;
	}

	static async resetBadges() {
		this.remove(Key.hideBadgeDonate, false);
		this.remove(Key.hideBadgeFollow, false);
		this.remove(Key.hideBadgeShare, false);
	}

	static async getBlockedAdsCount(): Promise<number> {
		let blockedAdsCount: number = (await this.get(Key.blockedAdsCounts)) as number;

		if (blockedAdsCount === undefined) {
			blockedAdsCount = 0;
			this.set(Key.blockedAdsCounts, blockedAdsCount);
		}

		return blockedAdsCount;
	}

	static async increaseBlockedAdsCount() {
		let blockedAdsCount = await this.getBlockedAdsCount();
		blockedAdsCount++;
		this.set(Key.blockedAdsCounts, blockedAdsCount);
	}

	static async isBlockerRunning() {
		return (await this.get(Key.blockerRunning)) as boolean;
	}

	static setBlockerRunning(isRunning: boolean) {
		this.set(Key.blockerRunning, isRunning);
	}

	protected static async get(key: Key, groupedByUser = true): Promise<StorageValue> {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		const value = await storage.local.get(storageKey);
		return value[storageKey];
	}

	protected static async set(key: Key, value: StorageValue, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		await storage.local.set({ [storageKey]: value });
	}

	protected static async remove(key: Key, groupedByUser = true) {
		const storageKey = groupedByUser ? await Storage.prefix(key) : key;
		await storage.local.remove(storageKey);
	}

	private static async prefix(key: Key) {
		const id = await this.getIdentity();
		return `${id}_${key}`;
	}
}
