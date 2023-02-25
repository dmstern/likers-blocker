import Messenger from "../Messages";
import settings from "../settings";
import Storage from "../Storage";
import { UserInfo } from "../UserInfo";

export default class LoginDisplay {
	private main: HTMLElement;
	private userInfo: UserInfo | undefined;

	constructor() {
		this.init();
	}

	private async init() {
		this.userInfo = await Storage.getUserInfo();

		if (!this.userInfo || this.userInfo?.errors?.length) {
			//send request to get user info to other tab
			const messageResponse = await Messenger.sendGetUserInfo();
			this.userInfo = messageResponse?.userInfo;
		}

		if (!this.userInfo || this.userInfo.errors?.length) {
			return;
		}

		this.main = document.querySelector("main") as HTMLElement;
		this.setLoggedIn();
	}

	setLoggedIn() {
		this.main?.classList.add("logged-in");

		const profilePicture = this.userInfo.profile_image_url_https || settings.DEFAULT_PROFILE_IMG.normal;
		const screeName = this.userInfo.screen_name;
		const miniProfilePicture = profilePicture.replace("normal", "mini");
		const profilePictureElement = document.querySelector("#profile-picture") as HTMLImageElement;
		const userNameElement = document.querySelector("#user-name");

		if (!profilePictureElement || !userNameElement) {
			return;
		}

		profilePictureElement.src = miniProfilePicture;
		userNameElement.innerHTML = `@${screeName}`;
	}
}
