import APIService from "../APIService";
import LikersBlocker from "./LikersBlocker";
import Storage, { Key } from "../Storage";

import "./style.scss";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

async function storeUserInfo() {
	const userId = await Storage.getUserId();
	const response = await APIService.getUserInfo(userId);

	if (!response.ok) {
		return;
	}

	const userInfo = await response.json();
	console.info("👤 Storing userInfo", userInfo);
	Storage.set(Key.userInfo, userInfo);
}

LikersBlocker.run();
storeUserInfo();
