import { runtime } from "webextension-polyfill";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import Messenger from "../Messages";
import settings from "../settings";
// import settings from "../settings";
import Storage from "../Storage";
import { User } from "../UserInfo";
import "./popup.scss";

async function updateStats() {
	// updateInstantly = true) {
	// Stats:
	const queue = await Storage.getQueue();
	const blockedAccounts = await Storage.getBlockedAccounts();
	const queueLength = queue.size || 0;
	const blockedLength = blockedAccounts.size || 0;

	// Durations:
	// const blockPeriodInMinutes = settings.BLOCK_PERIOD_IN_MINUTES;
	// const driveWayInSeconds = (blockPeriodInMinutes * 60) / 2;

	// Nodes:
	const blockListNode = document.querySelector("#blockListStats") as HTMLElement;
	const queueListNode = document.querySelector("#blockQueueStats") as HTMLElement;
	const statsWrapperNode = document.querySelector(".stats") as HTMLElement;
	const blockListLabel = blockListNode.parentElement;
	const queueListLabel = queueListNode.parentElement;
	// const truckIcon = document.querySelector(".stats .truck-icon") as HTMLElement;

	// Conditions:
	const hasQueue = queueLength > 0;
	const hasBlocked = blockedLength > 0;

	// if (updateInstantly) {
	queueListNode.innerHTML = queueLength.toLocaleString();
	blockListNode.innerHTML = blockedLength.toLocaleString();
	// } else {
	// 	console.log("👂 Event listener should be added");
	// 	// sync update of numbers to truck animations:
	// 	truckIcon.addEventListener(
	// 		"animationiteration animationstart",
	// 		() => {
	// 			console.log("🧙‍♂️ animationiteration update stats");
	// 			queueListNode.innerHTML = queueLength.toLocaleString();
	// 			// update blocklist later to fit truck animation:
	// 			setTimeout(() => {
	// 				console.log("🧙‍♂️ timeout: update blocklist");
	// 				blockListNode.innerHTML = blockedLength.toLocaleString();
	// 			}, driveWayInSeconds * 1000);
	// 		},
	// 		{
	// 			once: true,
	// 		}
	// 	);
	// }

	// Set or remove css classes for coloring and animations:
	statsWrapperNode.classList.toggle("has-queue", hasQueue);
	queueListLabel.classList.toggle("active", hasQueue);
	blockListLabel.classList.toggle("active", hasBlocked);

	// Calculate space between queue and blockedList for drive way:
	// const { left, width } = queueListLabel.getBoundingClientRect();
	// const blockLeftEdge = blockListLabel.getBoundingClientRect().left;
	// const truckWidth = truckIcon?.clientWidth;
	// const difference = blockLeftEdge - left - width - truckWidth;

	// statsWrapperNode.style.setProperty("--drive-way", `${Math.round(difference / 2)}px`);
	// statsWrapperNode.style.setProperty("--drive-duration", `${driveWayInSeconds}s`);
}

async function getUserInfo() {
	let userInfo: User | undefined = await Storage.getUserInfo();

	if (!userInfo || userInfo?.errors?.length) {
		//send request to get user info to other tab
		const messageResponse = await Messenger.sendGetUserInfoMessage();
		userInfo = messageResponse?.userInfo;
	}

	if (!userInfo || userInfo.errors?.length) {
		return;
	}

	const main = document.querySelector("main");
	main?.classList.add("logged-in");

	const profilePicture = userInfo.profile_image_url_https || "";
	const screeName = userInfo.screen_name;
	const miniProfilePicture = profilePicture.replace("normal", "mini");
	const profilePictureElement = document.querySelector("#profile-picture") as HTMLImageElement;
	const userNameElement = document.querySelector("#user-name");

	if (!profilePictureElement || !userNameElement) {
		return;
	}

	profilePictureElement.src = miniProfilePicture;
	userNameElement.innerHTML = `@${screeName}`;
}

function alignRightButtons() {
	const rightButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".btn--issue");

	rightButtons.forEach((button) => {
		const parentLeft = button.parentElement.getBoundingClientRect().left;
		const left = button.getBoundingClientRect().left;

		setTimeout(() => {
			button.style.left = `${left - parentLeft}px`;
			button.style.position = "absolute";
		}, 1);
	});
}

async function initQueueAnimation() {
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
		avatar.title = `@${user.screen_name}`;
		avatar.classList.add("machine__avatar");
		setIndexToElement(avatar, index);
		accountsWrapper.prepend(avatar);
	});
}

function runAnimation() {
	const statsWrapperNode = document.querySelector(".stats") as HTMLElement;
	statsWrapperNode.classList.remove("blocking");
	setTimeout(() => {
		statsWrapperNode.classList.add("blocking");
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

(function () {
	localizeUI();
	injectIcons();
	alignRightButtons();
	updateStats();
	getUserInfo();
	initQueueAnimation();

	const optionsButton = document.querySelector("#options");
	optionsButton?.addEventListener("click", () => {
		runtime.openOptionsPage();
	});

	// Messenger.addBlockListener(async ({ blockSuccessful }) => {
	// 	console.log({ blockSuccessful });
	// 	if (blockSuccessful) {
	// 		runAnimation();
	// 	}
	// });

	Messenger.addQueueUpdateListener(async ({ dequeuedUser }) => {
		updateStats();

		if (dequeuedUser) {
			runAnimation();
		}
	});
})();
