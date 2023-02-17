import Badge from "./Badge";
import { UserInfo } from "./UserInfo";
import browser from "webextension-polyfill";
import Cookies from "./Cookies";
import settings from "./settings";

const date = new Date();

enum Key {
	includeRetweeters = "includeRetweeters",
	hideBadgeShare = "hideBadgeShare",
	hideBadgeDonate = "hideBadgeDonate",
	hideBadgeFollow = "hideBadgeFollow",
	hideIdleWarning = "hideIdleWarning",
	packageVersion = "packageVersion",
	installedNewReleaseDate = "installedNewReleaseDate",
	authorization = "authorization",
	csfr = "csfr",
	blockingQueue = "blockingQueue",
	blockedAccounts = "blockedAccounts",
	acceptedLanguage = "acceptedLanguage",
	userInfo = "userInfo",
	userId = "userId",
	lang = "lang",
	blockDelayInMinutes = "blockDelayInMinutes",
	blockPeriodInMinutes = "blockPeriodInMinutes",
	blockAccountsAtOnce = "blockAccountsAtOnce",
	intervalBetweenBlockAccounts = "intervalBetweenBlockAccounts"
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

export default class Storage {
	private static async prefix(key: Key) {
		const id = await this.getIdentity();
		return `${id}_${key}`;
	}

	private static async get(key: Key, groupedByUser = true): Promise<unknown> {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		const value = await browser.storage.local.get(storageKey);
		return value[storageKey];
	}

	private static async set(key: Key, value: unknown, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		browser.storage.local.set({ [storageKey]: value })?.then();
	}

	private static async remove(key: Key, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		browser.storage.local.remove(storageKey)?.then();
	}

	static async getIdentity(): Promise<string> {
		let identity = await this.get(Key.userId, false);
		console.log("identityFromStorage", identity);

		if (!identity) {
			identity = await Cookies.getIdentity();
			console.log("identityFrom Cookies", identity);
			Storage.set(Key.userId, identity, false);
		}

		return identity as Promise<string>;
	}

	static async setIdentity(userId: string) {
		this.set(Key.userId, userId, false);
	}

	static async getLanguage(): Promise<string> {
		let language: string | undefined = (await this.get(Key.lang)) as string;

		if (!language) {
			language = await Cookies.getLanguage();
		}

		if (!language) {
			language = browser.runtime.getManifest().default_locale;
		}

		Storage.set(Key.lang, language);
		return language as string;
	}

	static async getCSFR(): Promise<string> {
		return this.get(Key.csfr) as Promise<string>;
	}

	static async getAuthToken(): Promise<string> {
		return this.get(Key.authorization) as Promise<string>;
	}

	static async getAcceptedLanguage(): Promise<string> {
		return this.get(Key.acceptedLanguage) as Promise<string>;
	}

	static async setCSFR(value: string) {
		this.set(Key.csfr, value);
	}

	static async setAuthToken(value: string) {
		this.set(Key.authorization, value);
	}

	static async setAcceptedLanguage(value: string) {
		this.set(Key.acceptedLanguage, value);
	}

	static async getUserInfo(): Promise<UserInfo> {
		return (await this.get(Key.userInfo)) as Promise<UserInfo>;
	}

	static setUserInfo(userInfo: UserInfo) {
		if (userInfo.errors) {
			return;
		}

		this.set(Key.userInfo, userInfo);
	}

	static async getPackageVersion(): Promise<string> {
		return this.get(Key.packageVersion) as Promise<string>;
	}

	static async getIncludeRetweeters(): Promise<boolean> {
		return this.get(Key.includeRetweeters) as Promise<boolean>;
	}

	static setIncludeRetweeters(value: boolean) {
		this.set(Key.includeRetweeters, value);
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
		const value = this.get(Key.installedNewReleaseDate);
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
		if (storedVersion !== browser.runtime.getManifest().version) {
			this.remove(Key.hideBadgeDonate);
			this.remove(Key.hideBadgeFollow);
			this.remove(Key.hideBadgeShare);
			this.setInstalledNewReleaseDate(values.today);
			this.set(Key.packageVersion, browser.runtime.getManifest().version);
		}
	}

	static async getQueue(): Promise<string[]> {
		let queued = (await this.get(Key.blockingQueue)) as string[] | undefined;

		if (!queued) {
			queued = [];
		}

		Badge.updateBadgeCount(queued.length);

		return queued;
	}

	static async queue(userHandle: string) {
		const queue = await this.getQueue();

		if (queue.includes(userHandle)) {
			return;
		}

		queue.push(userHandle);
		Badge.updateBadgeCount(queue.length);
		this.set(Key.blockingQueue, queue);
	}

	static async dequeue(userHandle?: string) {
		const queue = await this.getQueue();

		if (!userHandle) {
			userHandle = queue.shift();
		}

		const set = new Set(queue);

		if (userHandle) {
			set.delete(userHandle);
		}

		const newQueue = Array.from(set);

		this.set(Key.blockingQueue, newQueue);
		//console.log("remaining: " + Array.from(set).length)
		Badge.updateBadgeCount(newQueue.length);
		return userHandle;
	}

	static async queueMulti(userHandles: string[]) {
		const queue: string[] = await this.getQueue();
		const set: Set<string> = new Set<string>(queue.concat(userHandles));
		//console.log("Queue Length: " + Array.from(set).length)
		const newQueue = Array.from(set);
		Badge.updateBadgeCount(newQueue.length);
		this.set(Key.blockingQueue, newQueue);
	}

	static async queueEmpty(): Promise<boolean> {
		const queue = await this.getQueue();
		return queue.length === 0;
	}

	static async getBlockedAccounts(): Promise<string[]> {
		let blocked = (await this.get(Key.blockedAccounts)) as string[] | undefined;

		if (!blocked) {
			blocked = [];
		}

		return blocked;
	}

	static async addBlockedMulti(userHandles: string[]) {
		const blocked: string[] = await this.getBlockedAccounts();
		const set: Set<string> = new Set<string>(blocked.concat(userHandles));
		this.set(Key.blockedAccounts, Array.from(set));
	}

	static async addBlocked(userHandle: string) {
		const blocked = await this.getBlockedAccounts();

		if (blocked.includes(userHandle)) {
			return;
		}

		blocked.push(userHandle);
		this.set(Key.blockedAccounts, blocked);
	}

	static async getBlockDelayInMinutes(): Promise<number> {
		let value = await (this.get(Key.blockDelayInMinutes) as Promise<number>);

		if (value === undefined || value === null) {
			value = settings.BLOCK_DELAY_IN_MINUTES;
			this.set(Key.blockDelayInMinutes, value);
		}

		return value;
	}

	static async getBlockPeriodInMinutes(): Promise<number> {
		let value: number = await (this.get(Key.blockPeriodInMinutes) as Promise<number>);

		if (value === undefined || value === null) {
			value = settings.BLOCK_PERIOD_IN_MINUTES;
			this.set(Key.blockPeriodInMinutes, value);
		}

		return value;
	}

	static async getBlockAccountsAtOnce(): Promise<number> {
		let value: number = await (this.get(Key.blockAccountsAtOnce) as Promise<number>);

		if (value === undefined || value === null) {
			value = settings.BLOCK_ACCOUNTS_AT_ONCE;
			this.set(Key.blockAccountsAtOnce, value);
		}

		return value;
	}

	static async getIntervalBetweenBlockAccountsInSeconds(): Promise<number> {
		let value: number = await (this.get(Key.intervalBetweenBlockAccounts) as Promise<number>);

		if (value === undefined || value === null) {
			value = settings.INTERVAL_BETWEEN_BLOCKED_ACCOUNTS_IN_SECONDS;
			this.set(Key.intervalBetweenBlockAccounts, value);
		}

		return value;
	}

	static async setBlockDelayInMinutes(value: number) {
		this.set(Key.blockDelayInMinutes, value);
	}

	static async setBlockPeriodInMinutes(value: number) {
		this.set(Key.blockPeriodInMinutes, value);
	}

	static async setBlockAccountsAtOnce(value: number) {
		this.set(Key.blockAccountsAtOnce, value);
	}

	static async setIntervalBetweenBlockAccounts(value: number) {
		this.set(Key.intervalBetweenBlockAccounts, value);
	}
}
