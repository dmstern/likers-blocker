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
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

const storageFacade = {
	get: async (key: Key): Promise<string | boolean | number> => {
		return new Promise((resolve, reject) => {
			client.storage.local.get(key, function (value) {
				if (value) {
					resolve(value[key]);
				} else {
					reject();
				}
			});
		});
	},
	set: async (key: Key, value: any) => {
		client.storage.local.set({ [key]: value })?.then();
	},
	remove: (key: Key) => {
		client.storage.local.remove(key)?.then();
	},
};

export default class Storage {
	static async get(key: Key): Promise<string | boolean | number> {
		return storageFacade.get(key);
	}

	static set(key: Key, value: string | boolean | number) {
		storageFacade.set(key, value);
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
}
