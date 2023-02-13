import { UserInfo } from "./UserInfo";

const client = typeof browser === "undefined" ? chrome : browser;

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
}

export enum CookieName {
	twid = "twid",
	lang = "lang",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

async function getCookie(name: CookieName): Promise<string> {
	if (client.cookies === undefined) {
		return document.cookie
			.split("; ")
			.find((row) => row.startsWith(`${name}=`))
			?.split("=")[1];
	} else {
		const cookie = await client.cookies.get({
			name,
			url: "https://twitter.com",
		});
		return cookie?.value;
	}
}

async function getIdentity(): Promise<string> {
	const id = await getCookie(CookieName.twid);
	return id.split("D")[1] || "";
}

const storageFacade = {
	get: async (key: Key): Promise<unknown> => {
		const id = await getIdentity();
		const value = await client.storage.local.get(id + "_" + key);
		return value[id + "_" + key];
	},
	set: async (key: Key, value: unknown) => {
		const id = await getIdentity();
		client.storage.local.set({ [id + "_" + key]: value })?.then();
	},
	remove: async (key: Key) => {
		const id = await getIdentity();
		client.storage.local.remove(id + "_" + key)?.then();
	},
};

export default class Storage {
	static async get(key: Key): Promise<unknown> {
		return storageFacade.get(key);
	}

	static set(key: Key, value: unknown) {
		storageFacade.set(key, value);
	}

	static async getLanguage(): Promise<string> {
		return getCookie(CookieName.lang) ?? "de";
	}

	static async getUserId(): Promise<string> {
		return await getIdentity();
	}

	static async getUserInfo(): Promise<UserInfo> {
		return (await this.get(Key.userInfo)) as Promise<UserInfo>;
	}

	static setUserInfo(userInfo: UserInfo) {
		this.set(Key.userInfo, userInfo);
	}

	static async getPackageVersion(): Promise<string> {
		return storageFacade.get(Key.packageVersion) as Promise<string>;
	}

	static async getIncludeRetweeters(): Promise<boolean> {
		return storageFacade.get(Key.includeRetweeters) as Promise<boolean>;
	}

	static setIncludeRetweeters(value: boolean) {
		storageFacade.set(Key.includeRetweeters, value);
	}

	static async getHideBadgeShare(): Promise<boolean> {
		return storageFacade.get(Key.hideBadgeShare) as Promise<boolean>;
	}

	static setHideBadgeShare(value: boolean) {
		storageFacade.set(Key.hideBadgeShare, value);
	}

	static async getHideBadgeDonate(): Promise<boolean> {
		return storageFacade.get(Key.hideBadgeDonate) as Promise<boolean>;
	}

	static setHideBadgeDonate(value: boolean) {
		storageFacade.set(Key.hideBadgeDonate, value);
	}

	static async getHideBadgeFollow(): Promise<boolean> {
		return storageFacade.get(Key.hideBadgeFollow) as Promise<boolean>;
	}

	static setHideBadgeFollow(value: boolean) {
		storageFacade.set(Key.hideBadgeFollow, value);
	}

	static async getHideIdleWarning(): Promise<boolean> {
		return storageFacade.get(Key.hideIdleWarning) as Promise<boolean>;
	}

	static setHideIdleWarning(value: boolean) {
		storageFacade.set(Key.hideIdleWarning, value);
	}

	static async getInstalledNewReleaseDate(): Promise<number> {
		const value = storageFacade.get(Key.installedNewReleaseDate);
		const dateFromStorage = parseInt(value[Key.installedNewReleaseDate]);
		return Number.isNaN(dateFromStorage) ? values.today : dateFromStorage;
	}

	static setInstalledNewReleaseDate(value: number) {
		storageFacade.set(Key.installedNewReleaseDate, value);
	}

	static async getIsNewRelease(): Promise<boolean> {
		const value = await this.getInstalledNewReleaseDate();
		return values.today < value + 3;
	}

	static async storePackageVersion() {
		const storedVersion = await this.getPackageVersion();
		if (storedVersion !== client.runtime.getManifest().version) {
			storageFacade.remove(Key.hideBadgeDonate);
			storageFacade.remove(Key.hideBadgeFollow);
			storageFacade.remove(Key.hideBadgeShare);
			this.setInstalledNewReleaseDate(values.today);
			storageFacade.set(Key.packageVersion, client.runtime.getManifest().version);
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

		this.set(Key.blockingQueue, Array.from(set));
		//console.log("remaining: " + Array.from(set).length)
		return userHandle;
	}

	static async queueMulti(userHandles: string[]) {
		const queue: string[] = await this.getQueue();
		const set: Set<string> = new Set<string>(queue.concat(userHandles));
		//console.log("Queue Length: " + Array.from(set).length)
		this.set(Key.blockingQueue, Array.from(set));
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
