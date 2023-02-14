import Badge from "./Badge";
import { UserInfo } from "./UserInfo";
import browser from "webextension-polyfill";
import Cookies from "./Cookies";

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
}

export enum CookieName {
	twid = "twid",
	lang = "lang",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

// async function getCookie(name: CookieName): Promise<string> {
// 	console.log("document.cookie", document.cookie);
// 	console.log("name", name);
// 	browser.cookies.get({
// 		name,
// 		url: "https://twitter.com/home",
// 	}).then(cookie => {
// 		console.log("then cookie", cookie);
// 	});

// 	console.log("browser.cookies.get", );
// 	const cookie = await browser.cookies.get({
// 		name,
// 		url: "https://twitter.com",
// 	});
// 	console.log("cookie", cookie);
// 	return cookie?.value;
// }

// async function getIdentity(): Promise<string | undefined> {
// 	const id = await getCookie(CookieName.twid);

// 	console.log("id", id);

// 	if (!id) {
// 		return;
// 	}

// 	return id.split("D")[1] || "";
// }

// const storageFacade = {
// 	get: async (key: Key): Promise<unknown> => {
// 		const id = await getIdentity();
// 		const value = await browser.storage.local.get(id + "_" + key);
// 		return value[id + "_" + key];
// 	},
// 	set: async (key: Key, value: unknown) => {
// 		const id = await getIdentity();
// 		browser.storage.local.set({ [id + "_" + key]: value })?.then();
// 	},
// 	remove: async (key: Key) => {
// 		const id = await getIdentity();
// 		browser.storage.local.remove(id + "_" + key)?.then();
// 	},
// };

export default class Storage {
	private static async prefix(key: Key) {
		const id = await this.getIdentity();
		return `${id}_${key}`;
	}

	static async get(key: Key, groupedByUser = true): Promise<unknown> {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		const value = await browser.storage.local.get(storageKey);
		return value[storageKey];
	}

	static async set(key: Key, value: unknown, groupedByUser = true) {
		const storageKey = groupedByUser ? await this.prefix(key) : key;
		browser.storage.local.set({ [storageKey]: value })?.then();
	}

	static async remove(key: Key, groupedByUser = true) {
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
		let language = await this.get(Key.lang) as string;

		if (!language) {
			language = await Cookies.getLanguage();
			Storage.set(Key.lang, language);
		}

		if (!language) {
			language = browser.runtime.getManifest().default_locale;
		}

		return language;
	}

	static async getUserInfo(): Promise<UserInfo> {
		return (await this.get(Key.userInfo)) as Promise<UserInfo>;
	}

	static setUserInfo(userInfo: UserInfo) {
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
		this.set(Key.blockingQueue, newQueue);
		Badge.updateBadgeCount(newQueue.length);
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
}
