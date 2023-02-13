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
	console.log("=====");
	const userId = await Storage.getUserId();
	const response = await APIService.getUserInfo(userId);

	console.log("=== ", response);

	if (!response.ok) {
		return;
	}

	const userInfo = await response.json();
	console.debug(userInfo);
	Storage.set(Key.userInfo, userInfo);
}

LikersBlocker.run();
storeUserInfo();
