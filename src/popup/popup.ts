import Storage from "../Storage";
import browser from "webextension-polyfill";
import { UserInfo } from "../UserInfo";
import { Action } from "../Messages";
import { getTwitterTab } from "../Tabs";

function replaceData(dataName: string, callback: (element: HTMLElement, message: string) => void) {
	const elements = document.querySelectorAll(`[data-${dataName}]`) as NodeListOf<HTMLElement>;
	elements.forEach((element: HTMLElement) => {
		const messageName = element.dataset[dataName];

		if (!messageName) {
			return;
		}

		callback(element, browser.i18n.getMessage(messageName));
	});
}

function localizeUI() {
	replaceData("label", (element, message) => {
		element.innerHTML = message;
	});

	replaceData("href", (element, message) => {
		element.setAttribute("href", message);
	});

	replaceData("title", (element, message) => {
		element.setAttribute("title", message);
	});
}

async function getStats() {
	const blockQueue = await Storage.getQueue();
	const blockedAccounts = await Storage.getBlockedAccounts();
	const stats = {
		blockQueue: blockQueue.length || 0,
		blockedAccounts: blockedAccounts.length || 0,
	};
	const statsNode = document.querySelector("#blockListStats");
	const queueNode = document.querySelector("#blockQueueStats");
	if (statsNode && queueNode) {
		queueNode.innerHTML = stats.blockQueue.toString();
		statsNode.innerHTML = stats.blockedAccounts.toString();
	}
}

async function getUserInfo() {
	let userInfo: UserInfo | undefined = await Storage.getUserInfo();

	if (!userInfo || userInfo?.errors?.length) {
		//send request to get user info to other tab
		const twitterTab = await getTwitterTab();

		if (twitterTab) {
			const response = await browser.tabs.sendMessage(twitterTab.id, { action: Action.getUserInfo });
			console.log(response);
			userInfo = response.userInfo;
		}
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

function alignRightButton() {
	const rightButton: HTMLElement | null = document.querySelector(".btn.issue");
	const leftButton = rightButton?.parentElement?.children[0];

	if (leftButton && rightButton) {
		rightButton.style.left = getComputedStyle(leftButton).width;
	}
}

async function downloadBlockList() {
	const blockedAccounts = await Storage.getBlockedAccounts();
	if (blockedAccounts.length == 0) {
		return;
	}

	// single column CSV file
	const csvFilename = "blocked_accounts.csv";
	const file = new File([blockedAccounts.join("\n")], csvFilename, {
		type: "text/csv",
	});
	const downloadUrl = URL.createObjectURL(file);
	await browser.downloads.download({
		url: downloadUrl,
		conflictAction: "uniquify",
		filename: csvFilename,
	});
}

async function importBlockList() {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".csv";
	fileInput.style.display = "none";
	document.body.appendChild(fileInput);
	fileInput.click();
	fileInput.addEventListener("change", async () => {
		if (!fileInput.files || !fileInput.files[0]) {
			return;
		}

		const file = fileInput.files[0];
		const reader = new FileReader();
		reader.onload = async (e) => {
			if (!e.target) {
				return;
			}

			const text = e.target.result as string;
			console.log("Importing: ");
			const blockedAccounts = text.split(",\n");
			await Storage.queueMulti(blockedAccounts);
			await getStats();
		};
		reader.readAsText(file);
		fileInput.remove();
	});
}

const downloadListButton = document.querySelector("#downloadBlockList");
const importListButton = document.querySelector("#importBlockList");
downloadListButton?.addEventListener("click", downloadBlockList);
importListButton?.addEventListener("click", importBlockList);

(function () {
	localizeUI();
	alignRightButton();
	getStats();
	getUserInfo();

	browser.runtime.onMessage.addListener((message) => {
		if (message.action === Action.queueUpdate) {
			getStats();
		}
	});
})();
