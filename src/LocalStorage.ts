const client = typeof browser === "undefined" ? chrome : browser;

const date = new Date();

const keys = {
	retweeters: "lb.include-retweeters",
	hideBadgeShare: `lb.${client.runtime.getManifest().version}.hide-badge.share`,
	hideBadgeDonate: `lb.${client.runtime.getManifest().version}.hide-badge.donate`,
	hideBadgeFollow: `lb.${client.runtime.getManifest().version}.hide-badge.follow`,
	hideIdleWarning: `lb.${client.runtime.getManifest().version}.hide-idle-warning`,
	packageVersion: "lb.packageVersion",
	installedNewReleaseDate: "lb.installedNewReleaseDate",
};

const values = {
	hide: "true",
	today: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
};

export default class LocalStorage {
	static get packageVersion(): string {
		return localStorage.getItem(keys.packageVersion);
	}

	static get includeRetweeters(): boolean {
		const storedValue = localStorage.getItem(keys.retweeters);
		return storedValue === values.hide;
	}

	static set includeRetweeters(value: boolean) {
		localStorage.setItem(keys.retweeters, String(value));
	}

	static get hideBadgeShare(): boolean {
		return localStorage.getItem(keys.hideBadgeShare) === values.hide;
	}

	static set hideBadgeShare(value: boolean) {
		localStorage.setItem(keys.hideBadgeShare, String(value));
	}

	static get hideBadgeDonate(): boolean {
		return localStorage.getItem(keys.hideBadgeDonate) === values.hide;
	}

	static set hideBadgeDonate(value: boolean) {
		localStorage.setItem(keys.hideBadgeDonate, String(value));
	}

	static get hideBadgeFollow(): boolean {
		return localStorage.getItem(keys.hideBadgeFollow) === values.hide;
	}

	static set hideBadgeFollow(value: boolean) {
		localStorage.setItem(keys.hideBadgeFollow, String(value));
	}

	static get hideIdleWarning(): boolean {
		return localStorage.getItem(keys.hideIdleWarning) === values.hide;
	}

	static set hideIdleWarning(value: boolean) {
		localStorage.setItem(keys.hideIdleWarning, String(value));
	}

	static get installedNewReleaseDate(): string {
		return localStorage.getItem(keys.installedNewReleaseDate);
	}

	static set installedNewReleaseDate(value: string) {
		localStorage.setItem(keys.installedNewReleaseDate, String(value));
	}

	static get isNewRelease(): boolean {
		return LocalStorage.installedNewReleaseDate === values.today;
	}

	static storePackageVersion(): void {
		if (LocalStorage.packageVersion !== client.runtime.getManifest().version) {
			LocalStorage.installedNewReleaseDate = values.today;
			localStorage.setItem(keys.packageVersion, client.runtime.getManifest().version);
		}
	}
}
