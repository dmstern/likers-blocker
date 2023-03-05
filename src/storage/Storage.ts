import { runtime, storage } from "webextension-polyfill";
import Cookies from "../Cookies";
import { BlockedUser, QueuedUser, UserInfo } from "../User";

const date = new Date();

export enum Key {
	hideBadgeShare = "hideBadgeShare",
	hideBadgeDonate = "hideBadgeDonate",
	hideBadgeFollow = "hideBadgeFollow",
	hideIdleWarning = "hideIdleWarning",
	packageVersion = "packageVersion",
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
	blocksPerMinute = "options.blocksPerMinute",
	scrollsPerMinute = "options.scrollsPerMinute",
	adBlockerActive = "options.adBlockerActive",
	animationLevel = "options.animationLevel",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

type StorageValue = boolean | number | string | UserInfo | UserInfo[] | BlockedUser[] | QueuedUser[];

export default class Storage {
	private static async prefix(key: Key) {
		const id = await this.getIdentity();
		return `${id}_${key}`;
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

	static async setIdentity(userId: string) {
		this.set(Key.userId, userId, false);
	}

	static async getPackageVersion(): Promise<string> {
		return this.get(Key.packageVersion) as Promise<string>;
	}

	static async getHideBadgeShare(): Promise<boolean> {
		return this.get(Key.hideBadgeShare) as Promise<boolean>;
	}

	static setHideBadgeShare(value: boolean) {
		this.set(Key.hideBadgeShare, value);
	}

	static async getHideBadgeDonate(): Promise<boolean> {
		return this.get(Key.hideBadgeDonate) as Promise<boolean>;
	}

	static setHideBadgeDonate(value: boolean) {
		this.set(Key.hideBadgeDonate, value);
	}

	static async getHideBadgeFollow(): Promise<boolean> {
		return this.get(Key.hideBadgeFollow) as Promise<boolean>;
	}

	static setHideBadgeFollow(value: boolean) {
		this.set(Key.hideBadgeFollow, value);
	}

	static async getHideIdleWarning(): Promise<boolean> {
		return this.get(Key.hideIdleWarning) as Promise<boolean>;
	}

	static setHideIdleWarning(value: boolean) {
		this.set(Key.hideIdleWarning, value);
	}

	static async getInstalledNewReleaseDate(): Promise<number> {
		const value = await this.get(Key.installedNewReleaseDate);
		const dateFromStorage = parseInt(value[Key.installedNewReleaseDate]);
		return Number.isNaN(dateFromStorage) ? values.today : dateFromStorage;
	}

	static setInstalledNewReleaseDate(value: number) {
		this.set(Key.installedNewReleaseDate, value);
	}

	static async getIsNewRelease(): Promise<boolean> {
		const value = await this.getInstalledNewReleaseDate();
		return values.today < value + 3;
	}

	static async storePackageVersion() {
		const storedVersion = await this.getPackageVersion();
		if (storedVersion !== runtime.getManifest().version) {
			Storage.remove(Key.hideBadgeDonate);
			this.remove(Key.hideBadgeFollow);
			this.remove(Key.hideBadgeShare);
			this.setInstalledNewReleaseDate(values.today);
			this.set(Key.packageVersion, runtime.getManifest().version);
		}
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
}
