import { i18n, runtime } from "webextension-polyfill";
import Exporter from "../Exporter";
import Messenger from "../Messages";
import Storage from "../Storage";
import { User } from "../UserInfo";
import "./popup.scss";

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
	const truckIcon = document.querySelector(".stats__truck-icon") as HTMLElement;
	const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;

	console.log(downloadButton);

	// Conditions:
	const isBlocking = queueLength > 0;
	const hasBlocked = blockedLength > 0;

	// Download Button:
	if (downloadButton) {
		console.log(downloadButton);
		const { filename, url } = Exporter.prepareDownloadBlockList(blockedAccounts);
		console.log(downloadButton, blockedLength);
		if (blockedLength > 0) {
			downloadButton.href = url;
			downloadButton.download = filename;
			downloadButton.classList.remove("disabled");
		} else {
			downloadButton.removeAttribute("href");
			downloadButton.classList.add("disabled");
		}
	}

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
	const truckWidth = truckIcon.clientWidth;
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

function alignRightButton() {
	const rightButton: HTMLElement | null = document.querySelector(".btn--issue");
	const leftButton = rightButton?.parentElement?.children[0];

	if (leftButton && rightButton) {
		rightButton.style.left = getComputedStyle(leftButton).width;
	}
}

// async function downloadBlockList() {
// 	const blockedAccounts = await Storage.getBlockedAccounts();
// 	if (blockedAccounts.size == 0) {
// 		return;
// 	}

// 	// single column CSV file
// 	await Exporter.prepareDownloadBlockList(blockedAccounts);
// 	const csvFilename = "blocked_accounts.csv";
// 	const file = new File(
// 		[
// 			blockedAccounts
// 				.toArray()
// 				.map((user) => user.screen_name)
// 				.join("\n"),
// 		],
// 		csvFilename,
// 		{
// 			type: "text/csv",
// 		}
// 	);
// 	const downloadUrl = URL.createObjectURL(file);
// 	await downloads.download({
// 		url: downloadUrl,
// 		conflictAction: "uniquify",
// 		filename: csvFilename,
// 	});
// }

// async function importBlockList() {
// 	console.debug("importBlockList");
// 	const fileInput = document.createElement("input");
// 	fileInput.type = "file";
// 	fileInput.accept = ".csv";
// 	fileInput.style.display = "none";
// 	document.body.appendChild(fileInput);
// 	console.debug("fileInput appended");
// 	fileInput.click();
// 	fileInput.addEventListener("change", () => {
// 		console.debug("fileInput change");
// 		if (!fileInput.files || !fileInput.files[0]) {
// 			console.debug("not file");
// 			return;
// 		}

// 		const file = fileInput.files[0];
// 		console.debug(file);
// 		const reader = new FileReader();
// 		reader.onload = async (e) => {
// 			if (!e.target) {
// 				return;
// 			}

// 			// TODO: parse csv to json:
// 			// const text = e.target.result as string;
// 			// console.log("Importing: ");
// 			// const blockedAccounts = text.split(",\n");
// 			// await Storage.queueMulti(blockedAccounts);
// 			await updateStats();
// 		};
// 		reader.readAsText(file);
// 		fileInput.remove();
// 	});
// }

// const downloadListButton = document.querySelector("#downloadBlockList");
const importListButton = document.querySelector("#importBlockList");
// downloadListButton?.addEventListener("click", downloadBlockList);
importListButton?.addEventListener("click", () => {
	runtime.openOptionsPage();
});

(function () {
	localizeUI();
	alignRightButton();
	updateStats();
	getUserInfo();

	Messenger.addQueueUpdateListener(async () => {
		updateStats();
	});
})();
