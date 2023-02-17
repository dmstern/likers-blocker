import browser from "webextension-polyfill";

export enum CookieName {
	lang = "lang",
	twid = "twid",
}

export default class Cookies {
	private static async get(name: CookieName): Promise<string> {
		if (document && document?.cookie) {
			const entries = document.cookie.split("; ");
			return entries.find((row) => row?.startsWith(`${name}=`))?.split("=")[1];
		} else {
			const cookie = await browser.cookies.get({ name, url: "https://twitter.com" });
			return cookie?.value;
		}
	}

	static async getLanguage() {
		const lang = await this.get(CookieName.lang);
		return lang || browser.runtime.getManifest().default_locale;
	}

	static async getIdentity() {
		const id = await this.get(CookieName.twid);

		if (id?.startsWith("u%3D")) {
			return id.split("D")[1];
		}

		return "";
	}
}
