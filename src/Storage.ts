import Badge from "./Badge";
import { UserInfo, UserSet } from "./UserInfo";
import { storage, runtime } from "webextension-polyfill";
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
	intervalBetweenBlockAccountsInSeconds = "intervalBetweenBlockAccountsInSeconds",
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
		const value = await storage.local.get(storageKey);
		return value[storageKey];
	}

	private static async set(key: Key, value: unknown, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		storage.local.set({ [storageKey]: value })?.then();
	}

	private static async remove(key: Key, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		storage.local.remove(storageKey)?.then();
	}

	static async getIdentity(): Promise<string> {
		const idFromCookies = await Cookies.getIdentity();
		const idFromStorage = await this.get(Key.userId, false);
		let identity = idFromStorage;

		if (idFromCookies && idFromCookies !== idFromStorage) {
			identity = idFromCookies;
			Storage.set(Key.userId, idFromCookies, false);
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
			language = runtime.getManifest().default_locale;
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
		if (storedVersion !== runtime.getManifest().version) {
			this.remove(Key.hideBadgeDonate);
			this.remove(Key.hideBadgeFollow);
			this.remove(Key.hideBadgeShare);
			this.setInstalledNewReleaseDate(values.today);
			this.set(Key.packageVersion, runtime.getManifest().version);
		}
	}

	static async getQueue(): Promise<UserInfo[]> {
		let queued = (await this.get(Key.blockingQueue)) as UserInfo[] | undefined;

		if (!queued) {
			queued = [];
		}

		Badge.updateBadgeCount(queued.length);

		return queued;
	}

	static async queue(user: UserInfo) {
		const queue = await this.getQueue();

		if (queue.includes(user)) {
			return;
		}

		queue.push(user);
		Badge.updateBadgeCount(queue.length);
		this.set(Key.blockingQueue, queue);
	}

	static async dequeue(user?: UserInfo) {
		const queue = await this.getQueue();

		if (!user) {
			user = queue.shift();
		}

		const set = new UserSet(queue);

		if (user) {
			set.delete(user);
		}

		const newQueue = set.getUsers();

		this.set(Key.blockingQueue, newQueue);
		//console.log("remaining: " + Array.from(set).length)
		Badge.updateBadgeCount(newQueue.length);
		return user;
	}

	static async queueMulti(users: UserInfo[]) {
		const queue: UserInfo[] = await this.getQueue();
		const set: UserSet = new UserSet(queue.concat(users));
		//console.log("Queue Length: " + Array.from(set).length)
		const newQueue = set.getUsers();
		Badge.updateBadgeCount(newQueue.length);
		this.set(Key.blockingQueue, newQueue);
	}

	static async queueEmpty(): Promise<boolean> {
		const queue = await this.getQueue();
		return queue.length === 0;
	}

	static async getBlockedAccounts(): Promise<UserInfo[]> {
		let blocked = (await this.get(Key.blockedAccounts)) as UserInfo[] | undefined;

		if (!blocked) {
			blocked = [];
		}

		return blocked;
	}

	static async addBlockedMulti(users: UserInfo[]) {
		const blocked: UserInfo[] = await this.getBlockedAccounts();
		const set: UserSet = new UserSet(blocked.concat(users));
		this.set(Key.blockedAccounts, set.getUsers());
	}

	static async addBlocked(userHandle: UserInfo) {
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
		let value: number = await (this.get(Key.intervalBetweenBlockAccountsInSeconds) as Promise<number>);

		if (value === undefined || value === null) {
			value = settings.INTERVAL_BETWEEN_BLOCKED_ACCOUNTS_IN_SECONDS;
			this.set(Key.intervalBetweenBlockAccountsInSeconds, value);
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
		this.set(Key.intervalBetweenBlockAccountsInSeconds, value);
	}
}
