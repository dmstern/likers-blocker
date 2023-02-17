import browser from "webextension-polyfill";
// import { Key } from "../Storage";
import AccountCollector from "./AccountCollector";
import Storage from "../Storage";

import "./style.scss";
// import Cookies from "../Cookies";
// import Cookies from "../Cookies";
import APIService from "../APIService";
import { Action } from "../Messages";

//listen to messages from background
browser.runtime.onMessage.addListener((message) => {
	console.log("message from background", message);

	if (message.action === Action.getUserInfo) {
		return Storage.getUserInfo().then((userInfo) => {
			if (userInfo && userInfo.screen_name) {
				return Promise.resolve({ userInfo });
			} else {
				const profileLink = document.querySelector("a[data-testid=AppTabBar_Profile_Link]");
				if (profileLink instanceof HTMLAnchorElement) {
					return Storage.getIdentity().then((id) => {
						const screen_name = profileLink.href.split("/").pop();
						userInfo = { screen_name, id: parseInt(id) };
						return Promise.resolve({ userInfo });
					});
				}
			}
		});
	}

	if (message.action === Action.block) {
		console.log("block user", message.user);
		const user = message.user;
		return APIService.block(user).then(() => {
			return Promise.resolve({ blockDispatch: true });
		});
	}
});

AccountCollector.run();

// TODO: get cookies from content and store userId from cookies in storage for background and popup??
// async function storeUserDataFromCookies() {
// 	console.log("storeUserDataFromCookies()");
// 	const userId = await Cookies.getIdentity();
// 	const lang = await Cookies.getLanguage();

// 	console.log("storing userId...");
// 	console.log("storing language...");

// 	if (!lang || !userId) {
// 		return;
// 	}

// 	Storage.set(Key.lang, lang);
// 	Storage.set(Key.userId, userId);

// 	console.log("stored: ", await Storage.get(Key.userId));

// retrieveUserInfoFromApi();
// }

// async function retrieveUserInfoFromApi() {
// 	console.log("fetch UserInfoFromApi()...");
// 	const userId = await Storage.getIdentity();
// 	console.log("content-script userId:", userId);
// 	const userInfo = await APIService.getUserInfo(userId);
// 	console.log("userInfo from API:", userInfo);

// 	if (userInfo) {
// 		Storage.setUserInfo(userInfo);
// 		return userInfo;
// 	}
// }

// setTimeout(() => {
// 	console.log("listener");
// 	storeUserDataFromCookies();
// }, 5000);
