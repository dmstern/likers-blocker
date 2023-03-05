import { List, Tweet } from "./APIResponseTypes";
import Messenger from "./Messages";
import BlockListStorage from "./storage/BlockListStorage";
import LoginStorage from "./storage/LoginStorage";
import QueueStorage from "./storage/QueueStorage";
import { QueuedUser } from "./User";
const API_URL = "https://api.twitter.com/1.1/";

enum Endpoint {
	block = "blocks/create.json",
	// userInfo = "users/show",
	retweeters = "statuses/retweets",
	lookupUsers = "users/lookup",
	getTweet = "statuses/show",
	getList = "lists/show",
}

enum Method {
	POST = "POST",
	GET = "GET",
}

interface GetParams {
	endpoint: Endpoint;
	segment?: string;
	params?: Record<string, string>;
	preventPreflight?: boolean;
}

export default class APIService {
	// static async getUserInfo(userId: string): Promise<UserInfo | undefined> {
	// 	if (!userId) {
	// 		return;
	// 	}
	// 	const userInfo = await Storage.getUserInfo();
	// 	if (userInfo?.id.toString() === userId) {
	// 		return userInfo;
	// 	}
	// 	const response = this.sendGetRequest({ endpoint: Endpoint.userInfo, params: { user_id: userId }, preventPreflight: true });
	// 	return (await response).json();
	// }

	// static async lookupUsersById(userIds: string[]): Promise<Response> {
	// 	return this.sendGetRequest({
	// 		endpoint: Endpoint.lookupUsers,
	// 		params: { user_id: userIds.join(",") },
	// 	});
	// }

	// static async lookupUsersByScreenName(screenNames: string[]): Promise<Response> {
	// 	return this.sendGetRequest({
	// 		endpoint: Endpoint.lookupUsers,
	// 		params: { screen_name: screenNames.join(",") },
	// 	});
	// }

	static async block(user: QueuedUser): Promise<Response | undefined> {
		console.info(`👊 blocking ${user.screen_name}...`);
		const isAlreadyBlocked: boolean = (await BlockListStorage.getBlockedAccounts()).has(user);

		if (isAlreadyBlocked) {
			console.warn(`${user.screen_name} is already blocked.`);
			return;
		}

		const body = user.screen_name ? this.getScreenNameBody(user.screen_name) : this.getIdBody(user.id);
		const response = await this.sendPostRequest(Endpoint.block, body);
		const wasSuccessful = response && response.ok;

		if (wasSuccessful) {
			console.info("%c✔ user blocked.", "color: YellowGreen");
			BlockListStorage.addBlocked(user);
		} else {
			console.error("🛑 did not block", response);
			QueueStorage.queue(user);
		}

		Messenger.sendBlock({ success: wasSuccessful, status: response.status });
		return response;
	}

	static async getTweet(id: string): Promise<Tweet | undefined> {
		const response = await this.sendGetRequest({
			endpoint: Endpoint.getTweet,
			params: { id },
			preventPreflight: true,
		});

		if (response && response.ok) {
			const tweet = await response.json();
			return tweet;
		} else {
			console.error("No Tweet found", response);
		}
	}

	static async getList(id: string): Promise<List | undefined> {
		const response = await this.sendGetRequest({
			endpoint: Endpoint.getList,
			params: { list_id: id },
			preventPreflight: true,
		});

		if (response && response.ok) {
			const tweet = await response.json();
			return tweet;
		} else {
			console.error("No Tweet found", response);
		}
	}

	// static async getRetweeters(tweetId: string): Promise<User[]> {
	// 	// TODO: add pagination
	// 	const response = await this.sendGetRequest({
	// 		endpoint: Endpoint.retweeters,
	// 		segment: tweetId,
	// 	});

	// 	return new Promise((resolve, reject) => {
	// 		if (!response.ok) {
	// 			reject();
	// 		}

	// 		response.json().then((userInfos) => resolve(userInfos));
	// 	});
	// }

	private static getScreenNameBody(screenName: string): string {
		return `screen_name=${screenName}`;
	}

	private static getIdBody(id: string): string {
		return `user_id=${id}`;
	}

	private static async getHeaders(method: Method, preventPreflight = false): Promise<HeadersInit> {
		const csrf = (await LoginStorage.getCSFR()) as string;
		const authorization = (await LoginStorage.getAuthToken()) as string;
		const acceptedLanguage = (await LoginStorage.getAcceptedLanguage()) as string;
		const lang = await LoginStorage.getLanguage();
		console.debug("authorization " + authorization);
		if (!csrf || !authorization) {
			throw new Error("CSRF or Authorization not set");
		}
		console.debug("Prevent Preflight: " + preventPreflight);
		const ContentType =
			method === Method.POST ? "application/x-www-form-urlencoded" : "application/json";
		if (preventPreflight) {
			return {
				"Content-Type": "text/plain",
				authorization: authorization,
			};
		}
		console.debug(ContentType);
		return {
			"User-Agent": navigator.userAgent,
			Accept: "*/*",
			"Accept-Language": acceptedLanguage ?? "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
			"Content-Type": ContentType,
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

	private static async sendGetRequest({ endpoint, segment, params, preventPreflight }: GetParams) {
		const searchParams = new URLSearchParams(params);
		const segmentString = segment ? `/${segment}` : "";
		const url = new URL(`${API_URL}${endpoint}${segmentString}.json?${searchParams}`);
		//const requestInit = await this.getRequestInit();
		const headers = await this.getHeaders(Method.GET, preventPreflight || false);

		console.debug("fetching from API:", url);

		return fetch(url, {
			headers,
			method: "GET",
		});
	}
}
