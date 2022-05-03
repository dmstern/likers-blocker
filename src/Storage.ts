const client = typeof browser === "undefined" ? chrome : browser;

const date = new Date();

export enum Key {
	retweeters = "include-retweeters",
	hideBadgeShare = `hide-badge.share`,
	hideBadgeDonate = `hide-badge.donate`,
	hideBadgeFollow = `hide-badge.follow`,
	hideIdleWarning = `hide-idle-warning`,
	packageVersion = "packageVersion",
	installedNewReleaseDate = "installedNewReleaseDate",
}

const values = {
	today: parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`),
};

export default class Storage {
	static getPackageVersion(): Promise<string> {
		return client.storage.local.get(Key.packageVersion).then((value) => value[Key.packageVersion]);
	}

	static getIncludeRetweeters(): Promise<boolean> {
		return client.storage.local.get(Key.retweeters).then((value) => value[Key.retweeters]);
	}

	static async setIncludeRetweeters(value: boolean) {
		await client.storage.local.set({ [Key.retweeters]: value });
	}

	static getHideBadgeShare(): Promise<boolean> {
		return client.storage.local.get(Key.hideBadgeShare).then((value) => value[Key.hideBadgeShare]);
	}

	static async setHideBadgeShare(value: boolean) {
		await client.storage.local.set({ [Key.hideBadgeShare]: value });
	}

	static getHideBadgeDonate(): Promise<boolean> {
		return client.storage.local.get(Key.hideBadgeDonate).then((value) => value[Key.hideBadgeDonate]);
	}

	static async setHideBadgeDonate(value: boolean) {
		await client.storage.local.set({ [Key.hideBadgeDonate]: value });
	}

	static getHideBadgeFollow(): Promise<boolean> {
		return client.storage.local.get(Key.hideBadgeFollow).then((value) => value[Key.hideBadgeFollow]);
	}

	static async setHideBadgeFollow(value: boolean) {
		await client.storage.local.set({ [Key.hideBadgeFollow]: value });
	}

	static getHideIdleWarning(): Promise<boolean> {
		return client.storage.local.get(Key.hideIdleWarning).then((value) => value[Key.hideIdleWarning]);
	}

	static async setHideIdleWarning(value: boolean) {
		await client.storage.local.set({ [Key.hideIdleWarning]: value });
	}

	static getInstalledNewReleaseDate(): Promise<number> {
		return client.storage.local.get(Key.installedNewReleaseDate).then((value) => {
			const dateFromStorage = parseInt(value[Key.installedNewReleaseDate]);
			return Number.isNaN(dateFromStorage) ? values.today : dateFromStorage;
		});
	}

	static async setInstalledNewReleaseDate(value: number) {
		await client.storage.local.set({ [Key.installedNewReleaseDate]: value });
	}

	static getIsNewRelease(): Promise<boolean> {
		return this.getInstalledNewReleaseDate().then((value) => {
			return values.today < value + 3;
		});
	}

	static async storePackageVersion() {
		const storedVersion = await this.getPackageVersion();
		if (storedVersion !== client.runtime.getManifest().version) {
			await client.storage.local.remove(Key.hideBadgeDonate);
			await client.storage.local.remove(Key.hideBadgeFollow);
			await client.storage.local.remove(Key.hideBadgeShare);
			await this.setInstalledNewReleaseDate(values.today);
			await client.storage.local.set({ [Key.packageVersion]: client.runtime.getManifest().version });
		}
	}
}
