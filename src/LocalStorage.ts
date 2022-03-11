const keys = {
	retweeters: "lb.include-retweeters",
	hideBadgeShare: "lb.hide-badge.share",
	hideBadgeDonate: "lb.hide-badge.donate",
	hideBadgeFollow: "lb.hide-badge.follow",
};

export default class LocalStorage {
	static get includeRetweeters(): boolean {
		const storedValue = localStorage.getItem(keys.retweeters);
		return storedValue === "true";
	}

	static set includeRetweeters(value: boolean) {
		localStorage.setItem(keys.retweeters, String(value));
	}

	static get hideBadgeShare(): boolean {
		return localStorage.getItem(keys.hideBadgeShare) === "true";
	}

	static get hideBadgeDonate(): boolean {
		return localStorage.getItem(keys.hideBadgeDonate) === "true";
	}

	static get hideBadgeFollow(): boolean {
		return localStorage.getItem(keys.hideBadgeFollow) === "true";
	}

	static set hideBadgeShare(value: boolean) {
		localStorage.setItem(keys.hideBadgeShare, String(value));
	}

	static set hideBadgeDonate(value: boolean) {
		localStorage.setItem(keys.hideBadgeDonate, String(value));
	}

	static set hideBadgeFollow(value: boolean) {
		localStorage.setItem(keys.hideBadgeFollow, String(value));
	}
}
