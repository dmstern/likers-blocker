import { webRequest, WebRequest } from "webextension-polyfill";
import Messenger from "../Messages";
import LoginStorage from "../storage/LoginStorage";

export default class WebRequestInterceptor {
	static logURL(details: WebRequest.OnBeforeSendHeadersDetailsType): void {
		if (!details.requestHeaders) {
			return;
		}

		for (const header of details.requestHeaders) {
			const { name, value } = header;

			if (!value) {
				continue;
			}

			if (name === "authorization" && value.includes("Bearer")) {
				// console.debug("🔐 saving authentication token.");
				LoginStorage.setAuthToken(value);

				LoginStorage.getUserInfo().then((userInfo) => {
					if (!userInfo) {
						Messenger.sendGetUserInfo().then(({ userInfo }) => {
							LoginStorage.setUserInfo(userInfo);
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
