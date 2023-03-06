import { webRequest, WebRequest } from "webextension-polyfill";
import Messenger from "../Messages";
import LoginStorage from "../storage/LoginStorage";
import Blocker from "./Blocker";

export default class WebRequestInterceptor {
	static logURL(details: WebRequest.OnBeforeSendHeadersDetailsType): void {
		if (!details.requestHeaders) {
			return;
		}

		if (new URL(details.url).pathname.includes("logout.json")) {
			Blocker.stop();
			LoginStorage.logout();
		}

		for (const header of details.requestHeaders) {
			if (!header || !header.name || !header.value) {
				continue;
			}

			const { name, value } = header;

			if (!value) {
				continue;
			}

			if (name === "authorization" && value.includes("Bearer")) {
				// console.debug("🔐 saving authentication token.");
				LoginStorage.setAuthToken(value);

				LoginStorage.getUserInfo().then((userInfo) => {
					if (!userInfo) {
						Messenger.sendGetUserInfo().then((response) => {
							if (response && response.userInfo) {
								LoginStorage.login(response.userInfo);
							}
						});
					}
				});
			}

			const re = /[0-9A-Fa-f]{160}/;
			if (name === "x-csrf-token" && re.test(value) && value.length == 160) {
				// console.debug("⚙ saving csfr");
				LoginStorage.setCSFR(value);
			}

			if (name === "Accept-Language") {
				// console.debug("🌐 saving accepted language");
				LoginStorage.setAcceptedLanguage(value);
			}
		}
	}

	static interceptTwitterRequests() {
		webRequest.onBeforeSendHeaders.addListener(
			(details): void => {
				this.logURL(details);
			},
			{ urls: ["<all_urls>"] },
			["requestHeaders"]
		);
	}
}
