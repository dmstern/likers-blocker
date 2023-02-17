import browser from "webextension-polyfill";
import AccountCollector from "./AccountCollector";
import Storage from "../Storage";

import "./style.scss";
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
				const profileImg = document.querySelector(
					"header[role=\"banner\"] [data-testid^=\"UserAvatar-Container\"] div img"
				);

				if (profileLink instanceof HTMLAnchorElement && profileImg instanceof HTMLImageElement) {
					return Storage.getIdentity().then((id) => {
						const screen_name = profileLink.href.split("/").pop();
						const profile_image_url_https = profileImg.src;
						userInfo = { screen_name, profile_image_url_https, id: parseInt(id) };
						Storage.setUserInfo(userInfo);
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
