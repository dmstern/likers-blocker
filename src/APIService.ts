import Storage, { Key } from "./Storage";
import { UserInfo } from "./UserInfo";
const API_URL = "https://api.twitter.com/1.1/";

enum Endpoint {
	block = "blocks/create",
	userInfo = "users/show",
	retweeters = "statuses/retweets",
	lookupUsers = "users/lookup",
}

enum Method {
	POST = "POST",
	GET = "GET",
}

interface GetParams {
	endpoint: Endpoint;
	segment?: string;
	params?: Record<string, string>;
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

	private static async sendPostRequest(endpoint: Endpoint, body: string) {
		const requestInit = await this.getRequestInit();
		const headers = await this.getHeaders(Method.POST);

		return await fetch(`${API_URL}${endpoint}`, {
			...requestInit,
			headers,
			method: Method.POST,
			body,
		});
	}

	private static async sendGetRequest({ endpoint, segment, params }: GetParams) {
		const searchParams = new URLSearchParams(params);
		const segmentString = segment ? `/${segment}` : "";
		const url = new URL(`${API_URL}${endpoint}${segmentString}.json?${searchParams}`);
		const requestInit = await this.getRequestInit();
		const headers = await this.getHeaders(Method.GET);

		console.debug("fetching from API:", url);

		return fetch(url, {
			...requestInit,
			headers,
			method: "GET",
		});
	}

	static async getUserInfo(userId: string): Promise<UserInfo | undefined> {
		if (!userId) {
			return;
		}

		const response = this.sendGetRequest({ endpoint: Endpoint.userInfo, params: { user_id: userId } });
		return (await response).json();
	}

	static async lookupUsersById(userIds: string[]): Promise<Response> {
		return this.sendGetRequest({
			endpoint: Endpoint.lookupUsers,
			params: { user_id: userIds.join(",") },
		});
	}

	static async lookupUsersByScreenName(screenNames: string[]): Promise<Response> {
		return this.sendGetRequest({
			endpoint: Endpoint.lookupUsers,
			params: { screen_name: screenNames.join(",") },
		});
	}

	static async block(screenName: string): Promise<Response | undefined> {
		console.info(`⛔ blocking ${screenName}...`);

		const blocklist = (await Storage.getBlockedAccounts()) as string[];

		if (blocklist.includes(screenName)) {
			console.warn(`${screenName} is already blocked.`);
			return;
		}

		const response = await this.sendPostRequest(Endpoint.block, this.getScreenNameBody(screenName));

		if (response.status === 200) {
			console.info("✔ user blocked.");
			Storage.addBlocked(screenName);
		}

		return response;
	}

	static async getRetweeters(tweetId: string): Promise<UserInfo[]> {
		// TODO: add pagination
		const response = await this.sendGetRequest({
			endpoint: Endpoint.retweeters,
			segment: tweetId,
		});

		return new Promise((resolve, reject) => {
			if (!response.ok) {
				reject();
			}

			response.json().then((userInfos) => resolve(userInfos));
		});
	}
}
