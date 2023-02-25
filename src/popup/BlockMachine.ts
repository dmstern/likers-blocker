import Storage from "../Storage";
import settings from "../settings";

export default class BlockMachine {
	static async init() {
		const queue = await Storage.getQueue();
		const previewItemsInQueue = queue.toArray().slice(0, 50);
		const accountsWrapper = document.querySelector(".machine__accounts");

		if (!accountsWrapper) {
			return;
		}

		previewItemsInQueue.forEach((user, index) => {
			const avatar = document.createElement("span");
			const profileImgUrl = user.profile_image_url_https || settings.DEFAULT_PROFILE_IMG.mini;
			avatar.style.backgroundImage = `url(${profileImgUrl.replace("normal", "mini")}`;
			avatar.title = user.screen_name ? `@${user.screen_name}` : user.id.toString();
			avatar.classList.add("machine__avatar");
			setIndexToElement(avatar, index);
			accountsWrapper.prepend(avatar);
		});
	}

	static runAnimation() {
		const main = document.querySelector("main");
		main?.classList.remove("blocking");
		setTimeout(() => {
			main.classList.add("blocking");
		}, 1);

		const avatars = document.querySelectorAll(".machine__avatar") as NodeListOf<HTMLElement>;

		if (!avatars.length) {
			return;
		}

		avatars.forEach((avatar) => {
			let index: number = Number.parseInt(avatar.style.getPropertyValue("--index"));
			index = index - 1;
			setIndexToElement(avatar, index);
		});
	}
}

function setIndexToElement(avatar: HTMLElement, index: number) {
	if (index < -1) {
		return;
	}

	avatar.classList.remove(
		"machine__avatar--up",
		"machine__avatar--right",
		"machine__avatar--upcoming",
		"machine__avatar--hidden",
		"machine__avatar--blocking"
	);

	avatar.style.setProperty("--index", `${index}`);

	if (index === -1) {
		avatar.classList.add("machine__avatar--blocking");
	}

	if (index > -1 && index < 6) {
		avatar.classList.add("machine__avatar--up");
	}

	if (index >= 6 && index < 12) {
		avatar.classList.add("machine__avatar--right");
	}

	if (index === 12) {
		avatar.classList.add("machine__avatar--upcoming");
	}

	if (index >= 13) {
		avatar.classList.add("machine__avatar--hidden");
	}
}
