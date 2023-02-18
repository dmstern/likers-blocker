import Storage from "../Storage";
import { runtime, i18n, tabs, downloads } from "webextension-polyfill";
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

		callback(element, i18n.getMessage(messageName));
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
	const queue = await Storage.getQueue();
	const blockedAccounts = await Storage.getBlockedAccounts();
	const stats = {
		queue: queue.length || 0,
		blockedAccounts: blockedAccounts.length || 0,
	};

	const blockListNode = document.querySelector("#blockListStats");
	const queueListNode = document.querySelector("#blockQueueStats");
	const statsWrapperNode = document.querySelector(".stats");

	const blockListLabel = blockListNode.parentElement;
	const queueListLabel = queueListNode.parentElement;
	const isBlocking = stats.queue > 0;
	const hasBlocked = stats.blockedAccounts > 0;

	console.log(stats);

	if (blockListNode && queueListNode) {
		queueListNode.innerHTML = stats.queue.toString();
		blockListNode.innerHTML = stats.blockedAccounts.toString();
	}

	statsWrapperNode.classList.toggle("stats--blocking", isBlocking);
	queueListLabel.classList.toggle("active", isBlocking);
	blockListLabel.classList.toggle("active", hasBlocked);

	const { left, width } = queueListLabel.getBoundingClientRect();
	const blockLeftEdge = blockListLabel.getBoundingClientRect().left;
	const truckWidth = (document.querySelector(".stats__truck-icon") as HTMLElement).clientWidth;
	const difference = blockLeftEdge - left - width - truckWidth;
	(statsWrapperNode as HTMLElement).style.setProperty("--drive-way", `${Math.round(difference / 2)}px`);
}

async function getUserInfo() {
	let userInfo: UserInfo | undefined = await Storage.getUserInfo();

	if (!userInfo || userInfo?.errors?.length) {
		//send request to get user info to other tab
		const twitterTab = await getTwitterTab();

		if (twitterTab) {
			const response = await tabs.sendMessage(twitterTab.id, { action: Action.getUserInfo });
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
	await downloads.download({
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

	runtime.onMessage.addListener((message) => {
		if (message.action === Action.queueUpdate) {
			getStats();
		}
	});
})();
