// import browser from "webextension-polyfill";
import { Key } from "../Storage";
import AccountCollector from "./AccountCollector";
import Storage from "../Storage";

import "./style.scss";
import Cookies from "../Cookies";
import APIService from "../APIService";

AccountCollector.run();

// TODO: get cookies from content and store userId from cookies in storage for background and popup??
async function storeUserDataFromCookies() {
	console.log("storeUserDataFromCookies()");
	const userId = await Cookies.getIdentity();
	const lang = await Cookies.getLanguage();

	console.log("storing userId...");
	console.log("storing language...");

	if (!lang || !userId) {
		return;
	}

	Storage.set(Key.lang, lang);
	Storage.set(Key.userId, userId);

	console.log("stored: ", await Storage.get(Key.userId));

	retrieveUserInfoFromApi();
}

async function retrieveUserInfoFromApi() {
	console.log("fetch UserInfoFromApi()...");
	const userId = await Storage.getIdentity();
	console.log("content-script userId:", userId);
	const userInfo = await APIService.getUserInfo(userId);
	console.log("userInfo from API:", userInfo);

	if (userInfo) {
		Storage.setUserInfo(userInfo);
	}
}

setTimeout(() => {
	console.log("listener");
	storeUserDataFromCookies();
}, 5000);
