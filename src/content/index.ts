import Badge from "../Badge";
import Messenger from "../Messages";
import Storage from "../Storage";
import AccountCollector from "./AccountCollector";
import "./styles/index.scss";

//listen to messages from background
Messenger.onGetUserInfo(async () => {
	let userInfo = await Storage.getUserInfo();

	if (userInfo && userInfo.screen_name) {
		return Promise.resolve({ userInfo });
	}

	const profileLink = document.querySelector("a[data-testid=AppTabBar_Profile_Link]");
	const profileImg = document.querySelector(
		'header[role="banner"] [data-testid^="UserAvatar-Container"] div img'
	);

	if (profileLink instanceof HTMLAnchorElement && profileImg instanceof HTMLImageElement) {
		const userId = await Storage.getIdentity();
		const screen_name = profileLink.href.split("/").pop();
		const profile_image_url_https = profileImg.src;
		userInfo = { screen_name, profile_image_url_https, id: parseInt(userId) };
		Storage.setUserInfo(userInfo);
		return Promise.resolve({ userInfo });
	}
});

AccountCollector.run();

Messenger.onQueueUpdate(async ({ queueLength }) => {
	return Badge.updateBadgeCount(queueLength);
});
