import { cookies, runtime } from "webextension-polyfill";

export enum CookieName {
	lang = "lang",
	twid = "twid",
}

export default class Cookies {
	private static async get(name: CookieName): Promise<string> {
		if (cookies && cookies.get) {
			const cookie = await cookies.get({ name, url: "https://twitter.com" });
			return cookie?.value;
		} else {
			const entries = document.cookie.split("; ");
			return entries.find((row) => row?.startsWith(`${name}=`))?.split("=")[1];
		}
	}

	static async getLanguage() {
		const lang = await this.get(CookieName.lang);
		return lang || runtime.getManifest().default_locale;
	}

	static async getIdentity() {
		const id = await this.get(CookieName.twid);

		if (id?.startsWith("u%3D")) {
			return id.split("D")[1];
		}

		return "";
	}
}
