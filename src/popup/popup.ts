import { runtime } from "webextension-polyfill";
import { injectIcons } from "../content/icons";
import { localizeUI } from "../Localization";
import Messenger from "../Messages";
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
	const blockPeriodInMinutes = await Storage.getBlockPeriodInMinutes();
	const driveWayInSeconds = (blockPeriodInMinutes * 60) / 2;

	// Nodes:
	const blockListNode = document.querySelector("#blockListStats") as HTMLElement;
	const queueListNode = document.querySelector("#blockQueueStats") as HTMLElement;
	const statsWrapperNode = document.querySelector(".stats") as HTMLElement;
	const blockListLabel = blockListNode.parentElement;
	const queueListLabel = queueListNode.parentElement;
	const truckIcon = document.querySelector(".stats .truck-icon") as HTMLElement;

	// Conditions:
	const isBlocking = queueLength > 0;
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
	statsWrapperNode.classList.toggle("stats--blocking", isBlocking);
	queueListLabel.classList.toggle("active", isBlocking);
	blockListLabel.classList.toggle("active", hasBlocked);

	// Calculate space between queue and blockedList for drive way:
	const { left, width } = queueListLabel.getBoundingClientRect();
	const blockLeftEdge = blockListLabel.getBoundingClientRect().left;
	const truckWidth = truckIcon?.clientWidth;
	const difference = blockLeftEdge - left - width - truckWidth;

	statsWrapperNode.style.setProperty("--drive-way", `${Math.round(difference / 2)}px`);
	statsWrapperNode.style.setProperty("--drive-duration", `${driveWayInSeconds}s`);
}

async function getUserInfo() {
	let userInfo: User | undefined = await Storage.getUserInfo();

	if (!userInfo || userInfo?.errors?.length) {
		//send request to get user info to other tab
		userInfo = (await Messenger.sendGetUserInfoMessage()).userInfo;
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

(function () {
	localizeUI();
	injectIcons();
	alignRightButtons();
	updateStats();
	getUserInfo();

	const optionsButton = document.querySelector("#options");
	optionsButton?.addEventListener("click", () => {
		runtime.openOptionsPage();
	});

	Messenger.addQueueUpdateListener(async () => {
		updateStats();
	});
})();
