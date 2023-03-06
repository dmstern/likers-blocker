import Messenger from "../Messages";
import LoginStorage from "../storage/LoginStorage";
import OptionsStorage from "../storage/OptionsStorage";
import Storage from "../storage/Storage";
import { tryToAccessDOM } from "../util";
import AccountCollector from "./AccountCollector";
import AdBlocker from "./AdBlocker";
// import { injectFonts } from "./Fonts";
import "./styles/index.scss";

(function () {
	//listen to messages from background
	Messenger.onGetUserInfo(async () => {
		let userInfo = await LoginStorage.getUserInfo();

		if (userInfo && userInfo.screen_name) {
			return Promise.resolve({ userInfo });
		}

		const profileLink = await tryToAccessDOM("a[data-testid=AppTabBar_Profile_Link]");
		const profileImg = await tryToAccessDOM(
			'header[role="banner"] [data-testid^="UserAvatar-Container"] div img'
		);

		if (profileLink instanceof HTMLAnchorElement && profileImg instanceof HTMLImageElement) {
			const userId = await Storage.getIdentity();
			const screen_name = profileLink.href.split("/").pop();
			const profile_image_url_https = profileImg.src;
			userInfo = { screen_name, profile_image_url_https, id: parseInt(userId) };
			LoginStorage.login(userInfo);
			return Promise.resolve({ userInfo });
		}
	});

	AccountCollector.run();

	OptionsStorage.isAdBlockerActive().then((isAdBlockerActive) => {
		if (isAdBlockerActive) {
			AdBlocker.start();
		}
	});

	Messenger.onToggleAdBlocker((shouldAdBlockerBeActive) => {
		if (shouldAdBlockerBeActive) {
			AdBlocker.start();
		} else {
			AdBlocker.stop();
		}
	});

	setTimeout(() => {
		// console.log("%cadding LikersBlocker fonts", "background: RedOrange");
		// injectFonts();
	}, 10000);
})();
