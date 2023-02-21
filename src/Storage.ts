import { runtime, storage } from "webextension-polyfill";
import Cookies from "./Cookies";
import Messenger from "./Messages";
import settings from "./settings";
import { BlockedUser, QueuedUser, User, UserSet } from "./UserInfo";

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
	blocksPerMinute = "blocksPerMinute",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

type StorageValue = boolean | number | string | User | User[] | BlockedUser[] | QueuedUser[];

export default class Storage {
	private static async prefix(key: Key) {
		const id = await this.getIdentity();
		return `${id}_${key}`;
	}

	private static async get(key: Key, groupedByUser = true): Promise<StorageValue> {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		const value = await storage.local.get(storageKey);
		return value[storageKey];
	}

	private static async set(key: Key, value: StorageValue, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		storage.local.set({ [storageKey]: value })?.then();
	}

	private static async remove(key: Key, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		storage.local.remove(storageKey)?.then();
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

	static async getUserInfo(): Promise<User> {
		const userInfo = (await this.get(Key.userInfo)) as User;
		return new Promise<User>((resolve) => resolve(userInfo));
	}

	static setUserInfo(userInfo: User) {
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

	static async getQueue(): Promise<UserSet<QueuedUser>> {
		let queued = (await this.get(Key.blockingQueue)) as QueuedUser[] | undefined;

		if (!queued) {
			queued = [];
		}

		Messenger.sendQueueUpdateMessage({ queueLength: queued.length });

		return new UserSet<QueuedUser>(queued);
	}

	static async queue(user: QueuedUser) {
		const queue = await this.getQueue();
		queue.add(user);
		Messenger.sendQueueUpdateMessage({ queueLength: queue.size });
		this.set(Key.blockingQueue, queue.toArray());
	}

	static async dequeue(): Promise<QueuedUser> {
		const queue = await this.getQueue();
		const user = queue.shift();
		this.set(Key.blockingQueue, queue.toArray());
		Messenger.sendQueueUpdateMessage({ queueLength: queue.size });
		return user;
	}

	static async queueMulti(users: QueuedUser[]) {
		const queue: UserSet<QueuedUser> = await this.getQueue();
		// console.log("Queue Length: " + Array.from(set).length)
		queue.concat(users);
		Messenger.sendQueueUpdateMessage({ queueLength: queue.size });
		this.set(Key.blockingQueue, queue.toArray());
	}

	static async queueEmpty(): Promise<boolean> {
		const queue = await this.getQueue();
		return queue.size === 0;
	}

	static async getBlockedAccounts(): Promise<UserSet<BlockedUser>> {
		let blocked = (await this.get(Key.blockedAccounts)) as BlockedUser[] | undefined;

		if (!blocked) {
			blocked = [];
			Storage.set(Key.blockedAccounts, blocked);
		}

		return new UserSet(blocked);
	}

	static async addBlockedMulti(users: QueuedUser[]) {
		const blocked: UserSet<BlockedUser> = await this.getBlockedAccounts();
		const blockCandidates = users.map((user) => ({
			screen_name: user.screen_name,
			interacted_with: user.interacted_with,
		}));

		blocked.concat(blockCandidates);
		this.set(Key.blockedAccounts, blocked.toArray());
	}

	static async addBlocked(user: QueuedUser) {
		const blocked = await this.getBlockedAccounts();
		const { screen_name, interacted_with } = user;
		blocked.add({ screen_name, interacted_with });
		this.set(Key.blockedAccounts, blocked.toArray());
	}

	static async setBlocksPerMinute(value: number) {
		this.set(Key.blocksPerMinute, value, false);
	}

	static async getBlocksPerMinute(): Promise<number> {
		let blocksPerMinute: number = await (this.get(Key.blocksPerMinute, false) as Promise<
			number | undefined
		>);

		if (blocksPerMinute === undefined || blocksPerMinute === null) {
			blocksPerMinute = settings.BLOCKS_PER_MINUTE;
			this.setBlocksPerMinute(blocksPerMinute);
		}

		return blocksPerMinute;
	}
}
