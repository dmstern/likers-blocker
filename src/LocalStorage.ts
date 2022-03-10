const keys = {
	retweeters: "include-retweeters",
};

export default class LocalStorage {
	static get includeRetweeters(): boolean {
		const storedValue = localStorage.getItem(keys.retweeters);
		return storedValue === "true";
	}

	static set includeRetweeters(value: boolean) {
		localStorage.setItem(keys.retweeters, String(value));
	}
}
