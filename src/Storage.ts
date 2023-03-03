import { runtime, storage } from "webextension-polyfill";
import Cookies from "./Cookies";
import Messenger from "./Messages";
import settings from "./settings";
import { BlockedUser, QueuedUser, UserInfo, UserSet } from "./User";

const date = new Date();

export enum Key {
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
	scrollsPerMinute = "scrollsPerMinute",
	queueLength = "queueLength",
	blockListLength = "blockListLength",
	blockedAdsCounts = "blockedAdsCounts",
	adBlockerActive = "adBlockerActive",
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

	private static async get(key: Key, groupedByUser = true): Promise<StorageValue> {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		const value = await storage.local.get(storageKey);
		return value[storageKey];
	}

	private static async set(key: Key, value: StorageValue, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		await storage.local.set({ [storageKey]: value });
	}

	static async remove(key: Key, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
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
		const userInfo = (await this.get(Key.userInfo)) as UserInfo;
		return new Promise<UserInfo>((resolve) => resolve(userInfo));
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
			this.remove(Key.hideBadgeDonate);
			this.remove(Key.hideBadgeFollow);
			this.remove(Key.hideBadgeShare);
			this.setInstalledNewReleaseDate(values.today);
			this.set(Key.packageVersion, runtime.getManifest().version);
		}
	}

	static async getQueueLength(): Promise<number> {
		let queueLength: number = await (this.get(Key.queueLength) as Promise<number>);

		if (queueLength === undefined) {
			queueLength = (await this.getQueue()).size;
			this.setQueueLength(queueLength);
		}

		return queueLength;
	}

	private static async setQueueLength(queueLength: number): Promise<void> {
		this.set(Key.queueLength, queueLength);
		Messenger.sendQueueUpdate({ queueLength });
	}

	static async increaseQueueLength(): Promise<void> {
		let queueLength: number = await this.getQueueLength();
		queueLength++;

		Messenger.sendQueueUpdate({ queueLength });

		this.set(Key.queueLength, queueLength);
	}

	static async decreaseQueueLength(): Promise<void> {
		let queueLength: number = await this.getQueueLength();
		queueLength--;

		Messenger.sendQueueUpdate({ queueLength });

		this.set(Key.queueLength, queueLength);
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

	static async isAdBlockerActive(): Promise<boolean> {
		let isAdBlockerActive = (await this.get(Key.adBlockerActive)) as boolean;

		if (isAdBlockerActive === undefined) {
			isAdBlockerActive = true;
			this.setAdBlockerActive(isAdBlockerActive);
		}

		return isAdBlockerActive as boolean;
	}

	static async setAdBlockerActive(shouldBeActive: boolean) {
		this.set(Key.adBlockerActive, shouldBeActive);
	}

	static async getBlockListLength(): Promise<number> {
		let blockListLength: number = await (this.get(Key.blockListLength) as Promise<number>);

		if (blockListLength === undefined) {
			blockListLength = (await this.getBlockedAccounts()).size;
		}

		return blockListLength;
	}

	private static async increaseBlockListLength(): Promise<void> {
		let blockListLength: number = await this.getBlockListLength();
		blockListLength++;
		this.set(Key.blockListLength, blockListLength);
	}

	static async getQueue(): Promise<UserSet<QueuedUser>> {
		let queued = (await this.get(Key.blockingQueue)) as QueuedUser[] | undefined;

		if (!queued) {
			queued = [];
		}

		const queueLength = queued.length;
		this.setQueueLength(queueLength);

		return new UserSet<QueuedUser>(queued);
	}

	static async queue(user: QueuedUser) {
		const queue = await this.getQueue();
		const hasAdded = queue.add(user);

		if (hasAdded) {
			await this.increaseQueueLength();
		}

		this.set(Key.blockingQueue, queue.toArray());
	}

	static async dequeue(): Promise<QueuedUser> {
		const queue = await this.getQueue();
		const user = queue.shift();

		if (user) {
			await this.decreaseQueueLength();
		}

		this.set(Key.blockingQueue, queue.toArray());
		return user;
	}

	/**
	 * Add multiple users to queue.
	 * @param users a UserSet of the users to be queued
	 * @returns the number of new added users
	 */
	static async queueMulti(users: QueuedUser[]): Promise<number> {
		const queue: UserSet<QueuedUser> = await this.getQueue();

		// Avoid adding already blocked accounts to queue:
		const blockedAccounts: UserSet<BlockedUser> = await this.getBlockedAccounts();
		const newUsers = users.filter((user) => !blockedAccounts.has(user));
		const addedUsersCount: number = queue.merge(newUsers);

		this.set(Key.blockingQueue, queue.toArray());
		this.setQueueLength(queue.size);

		return addedUsersCount;
	}

	static async dequeueMulti(amount: number): Promise<QueuedUser[]> {
		const queue: UserSet<QueuedUser> = await this.getQueue();

		const dequeued = queue.splice(amount);
		this.set(Key.blockingQueue, queue.toArray());

		// DO NOT manipulate queueLength here! For better performance and realtime value display in popup, it's done in Blocker.ts

		return dequeued;
	}

	static async queueEmpty(): Promise<boolean> {
		const queueLength = await this.getQueueLength();
		return queueLength === 0;
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

		blocked.merge(blockCandidates);

		this.set(Key.blockListLength, blocked.size);
		this.set(Key.blockedAccounts, blocked.toArray());
	}

	static async addBlocked(user: QueuedUser) {
		const blocked = await this.getBlockedAccounts();
		const blockedUser: BlockedUser = {};

		if (user.screen_name) {
			blockedUser.screen_name = user.screen_name;
		}

		if (user.id) {
			blockedUser.id = user.id;
		}

		if (user.interacted_with) {
			blockedUser.interacted_with = user.interacted_with;
		}

		const wasAdded = blocked.add(blockedUser);
		if (wasAdded) {
			await this.increaseBlockListLength();
		}

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

	static async setScrollsPerMinute(value: number) {
		this.set(Key.scrollsPerMinute, value, false);
	}

	static async getScrollsPerMinute(): Promise<number> {
		let scrollsPerMinute: number = await (this.get(Key.scrollsPerMinute, false) as Promise<
			number | undefined
		>);

		if (scrollsPerMinute === undefined || scrollsPerMinute === null) {
			scrollsPerMinute = Math.round(60_000 / settings.SCROLL_INTERVAL);
			this.setScrollsPerMinute(scrollsPerMinute);
		}

		return scrollsPerMinute;
	}
}
