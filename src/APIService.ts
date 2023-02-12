import Storage, { Key } from "./Storage";
const API_URL = "https://api.twitter.com/1.1/";

export default class APIService {
	static async block(screenName: string) {
		console.info(`⛔ blocking ${screenName}...`);

		const csrf = (await Storage.get(Key.csfr)) as string;
		const authorization = (await Storage.get(Key.authorization)) as string;
		const blocklist = (await Storage.getBlockedAccounts()) as string[];
		const lang = await Storage.getLanguage();

		if (blocklist.includes(screenName)) {
			console.warn(`${screenName} is already blocked.`);
			return;
		}

		const response = await fetch(`${API_URL}blocks/create.json`, {
			credentials: "include",
			headers: {
				"User-Agent": navigator.userAgent,
				Accept: "*/*",
				"Accept-Language": "de-DE,en-US;q=0.7,en;q=0.3", // TODO read from twitter app
				"Content-Type": "application/x-www-form-urlencoded",
				"x-twitter-auth-type": "OAuth2Session",
				"x-twitter-client-language": lang,
				"x-twitter-active-user": "yes",
				"x-csrf-token": csrf,
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-site",
				"Sec-GPC": "1",
				authorization: authorization,
			},
			referrer: location.origin,
			body: `screen_name=${screenName}`,
			method: "POST",
			mode: "cors",
		});

		if (response.status === 200) {
			console.info("✔ user blocked.");
			Storage.addBlocked(screenName);
		}

		return response;
	}
}
