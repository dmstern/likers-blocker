import Messenger from "../Messages";
import settings from "../settings";
import LoginStorage from "../storage/LoginStorage";
import { UserInfo } from "../User";

export default class LoginDisplay {
	private main: HTMLElement;
	private userInfo: UserInfo | undefined;

	constructor() {
		this.initLoginLink();
		this.initLoginStatus();
	}

	private async initLoginStatus() {
		this.userInfo = await LoginStorage.getUserInfo();

		if (!this.userInfo || this.userInfo?.errors?.length) {
			//send request to get user info to other tab
			const messageResponse = await Messenger.sendGetUserInfo();
			this.userInfo = messageResponse?.userInfo;
			// this.userInfo = await LoginStorage.getUserInfo();
		}

		if (!this.userInfo || this.userInfo.errors?.length) {
			return;
		}

		this.main = document.querySelector("main") as HTMLElement;
		this.setLoggedIn();
	}

	initLoginLink() {
		const loginLink = document.querySelector("#loginLink");
		if (!loginLink) {
			return;
		}

		loginLink.addEventListener("click", async (event) => {
			event.preventDefault();

			const userInfo = await Messenger.sendLogin();
			if (userInfo) {
				this.initLoginStatus();
			}
		});
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
