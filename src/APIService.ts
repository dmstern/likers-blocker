import Storage, { Key } from "./Storage";
const API_URL = "https://api.twitter.com/1.1/";

enum Endpoint {
	block = "blocks/create.json",
	userInfo = "users/show.json",
}

enum Method {
	POST = "POST",
	GET = "GET",
}

export default class APIService {
	private static getScreenNameBody(screenName: string): string {
		return `screen_name=${screenName}`;
	}

	private static async getHeaders(method: Method) {
		const csrf = (await Storage.get(Key.csfr)) as string;
		const authorization = (await Storage.get(Key.authorization)) as string;
		const acceptedLanguage = (await Storage.get(Key.acceptedLanguage)) as string;
		const lang = await Storage.getLanguage();

		return {
			"User-Agent": navigator.userAgent,
			Accept: "*/*",
			"Accept-Language": acceptedLanguage,
			"Content-Type": method === Method.POST ? "application/x-www-form-urlencoded" : "application/json",
			"x-twitter-auth-type": "OAuth2Session",
			"x-twitter-client-language": lang,
			"x-twitter-active-user": "yes",
			"x-csrf-token": csrf,
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-site",
			"Sec-GPC": "1",
			authorization: authorization,
		};
	}

	private static async getRequestInit(): Promise<RequestInit> {
		return {
			credentials: "include",
			referrer: location.origin,
			mode: "cors",
		};
	}

	private static async postRequest(endpoint: Endpoint, body: string) {
		const requestInit = await this.getRequestInit();
		const headers = await this.getHeaders(Method.POST);

		return await fetch(`${API_URL}${endpoint}`, {
			...requestInit,
			headers,
			method: Method.POST,
			body,
		});
	}

	static async getRequest(endpoint: Endpoint, params: Record<string, string>) {
		const searchParams = new URLSearchParams(params);
		const url = new URL(`${API_URL}${endpoint}?${searchParams}`);
		const requestInit = await this.getRequestInit();
		const headers = await this.getHeaders(Method.GET);

		return fetch(url, {
			...requestInit,
			headers,
			method: "GET",
		});
	}

	static async getUserInfo(userId: string) {
		return this.getRequest(Endpoint.userInfo, { user_id: userId });
	}

	static async block(screenName: string) {
		console.info(`⛔ blocking ${screenName}...`);

		const blocklist = (await Storage.getBlockedAccounts()) as string[];

		if (blocklist.includes(screenName)) {
			console.warn(`${screenName} is already blocked.`);
			return;
		}

		const response = await this.postRequest(Endpoint.block, this.getScreenNameBody(screenName));

		if (response.status === 200) {
			console.info("✔ user blocked.");
			Storage.addBlocked(screenName);
		}

		return response;
	}
}
