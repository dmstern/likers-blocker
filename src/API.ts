import settings from "./settings";
import env from "./env";

const API_URL = "https://api.twitter.com";
let instance: API;

class API {
	private settings;
	private defaultFetchOptions: RequestInit;

	constructor() {
		this.settings = {...settings, ...env};
		this.defaultFetchOptions = {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${this.settings.BEARER_TOKEN}`,
			},
		};
	}

	async getLikers(tweetId: string) {
		const fetchUrl = `${API_URL}/2/tweets/${tweetId}/liking_users`;
		console.log("fetching juhuwulusu!!!", {fetchUrl});
		console.log("fetch options..::", this.defaultFetchOptions);
		const request = await fetch(fetchUrl, {...this.defaultFetchOptions});
		const response = await request.text();
		const data = JSON.parse(response);
		return data;
	}
}

if (!instance) {
	instance = new API();
}

export default instance;
