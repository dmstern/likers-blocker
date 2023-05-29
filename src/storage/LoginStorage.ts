import { runtime } from "webextension-polyfill";
import Cookies from "../Cookies";
import Messenger from "../Messages";
import { UserInfo } from "../User";
import BlockListStorage from "./BlockListStorage";
import Storage, { Key } from "./Storage";

export default class LoginStorage extends Storage {
	static login(userInfo: UserInfo) {
		BlockListStorage.resetCurrentBlocksCount();
		this.setUserInfo(userInfo);
		Messenger.sendLogin();
	}

	static logout() {
		super.remove(Key.userInfo);
		BlockListStorage.resetCurrentBlocksCount();
	}

	static async getLanguage(): Promise<string> {
		let language: string | undefined = (await this.get(Key.lang)) as string;

		if (!language) {
			language = await Cookies.getLanguage();
		}

		if (!language) {
			language = runtime.getManifest().default_locale;
		}

		Storage.set(Key.lang, language);
		return language as string;
	}

	static async getCSFR(): Promise<string> {
		return this.get(Key.csfr) as Promise<string>;
	}

	static async getAuthToken(): Promise<string> {
		return this.get(Key.authorization) as Promise<string>;
	}

	static async getAcceptedLanguage(): Promise<string> {
		return this.get(Key.acceptedLanguage) as Promise<string>;
	}

	static async setCSFR(value: string) {
		this.set(Key.csfr, value);
	}

	static async setAuthToken(value: string) {
		this.set(Key.authorization, value);
	}

	static async setAcceptedLanguage(value: string) {
		this.set(Key.acceptedLanguage, value);
	}

	static async getUserInfo(): Promise<UserInfo> {
		const userInfo = (await this.get(Key.userInfo)) as UserInfo;
		return new Promise<UserInfo>((resolve) => resolve(userInfo));
	}

	private static setUserInfo(userInfo: UserInfo) {
		if (userInfo.errors) {
			return;
		}

		this.set(Key.userInfo, userInfo);
	}
}
