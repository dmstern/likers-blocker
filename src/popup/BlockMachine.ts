import { i18n } from "webextension-polyfill";
import icons from "../icons";
import Messenger from "../Messages";
import settings from "../settings";
import QueueStorage from "../storage/QueueStorage";
import { QueuedUser } from "./../User";

const classes = {
	blockSuccess: "block--success",
	blockFail: "block--fail",
	unauthenticated: "unauthenticated",
};

export default class BlockMachine {
	static get accountsWrapper() {
		return document.querySelector(".machine__accounts");
	}

	static async init() {
		const queue = await QueueStorage.getTempQueue();

		if (!queue) {
			return;
		}

		queue.toArray().forEach((user, index) => {
			this.renderAvatar(user, index);
		});

		Messenger.onNextBatch(({ nextBatchFromStorage }) => {
			const avatars = document.querySelectorAll(".machine__avatar");
			const elementWithHighestIndex = avatars.item(0) as HTMLElement;
			const highestIndex = elementWithHighestIndex.style.getPropertyValue("--index");
			nextBatchFromStorage.forEach((user, index) => {
				this.renderAvatar(user, Number.parseInt(highestIndex) + index);
			});
		});
	}

	static async runBlockAnimation() {
		this.clearStateClasses();

		setTimeout(() => {
			document.body.classList.add(classes.blockSuccess);
			const trashLid = document.querySelector(".machine__trash .icon.trash-lid");
			trashLid.addEventListener("animationend", () => {
				document.body.classList.remove(classes.blockSuccess);
			});
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

	static runFailAnimation(status: number) {
		this.clearStateClasses();
		const errorSign = document.querySelector(".error-sign");
		const trash = document.querySelector(".machine__trash");
		const isUnauthenticated = status === 401;

		setTimeout(() => {
			document.body.classList.add(classes.blockFail);
			document.body.classList.toggle(classes.unauthenticated, isUnauthenticated);

			trash.addEventListener("animationend", () => {
				document.body.classList.remove(classes.blockFail);
			});
		}, 1);

		if (isUnauthenticated) {
			if (errorSign) {
				errorSign.innerHTML = `${icons.warn}<span>${i18n.getMessage("popup_unauthenticated")}</span>`;
			}
		}
	}

	private static renderAvatar(user: QueuedUser, index: number) {
		const avatar = document.createElement("span");
		const profileImgUrl = user.profile_image_url_https || settings.DEFAULT_PROFILE_IMG.mini;
		avatar.style.backgroundImage = `url(${profileImgUrl.replace("normal", "mini")}`;
		avatar.title = user.screen_name ? `@${user.screen_name}` : user.id.toString();
		avatar.classList.add("machine__avatar");
		setIndexToElement(avatar, index);
		this.accountsWrapper.prepend(avatar);
	}

	private static clearStateClasses() {
		document.body.classList.remove(...Object.values(classes));
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
