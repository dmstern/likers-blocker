import Storage from "../Storage";

const client = typeof browser === "undefined" ? chrome : browser;

function localizeUI() {
	const labelNodes = document.querySelectorAll("[data-label]");
	labelNodes.forEach((element: HTMLElement) => {
		const messageName = element.dataset.label;
		element.innerHTML = client.i18n.getMessage(messageName);
	});

	const hrefNodes = document.querySelectorAll("[data-href]");
	hrefNodes.forEach((element: HTMLElement) => {
		const messageName = element.dataset.href;
		const msg = client.i18n.getMessage(messageName);
		element.setAttribute("href", msg);
	});

	const titleNodes = document.querySelectorAll("[data-title]");
	titleNodes.forEach((element: HTMLElement) => {
		const messageName = element.dataset.title;
		const msg = client.i18n.getMessage(messageName);
		element.setAttribute("title", msg);
	});
}

async function getStats() {
	const blockQueue = await Storage.getQueue();
	const blockedAccounts = await Storage.getBlockedAccounts();
	const stats = {
		blockQueue: blockQueue.length || 0,
		blockedAccounts: blockedAccounts.length || 0,
	};
	document.querySelector("#queue").innerHTML = stats.blockQueue.toString();
	document.querySelector("#list").innerHTML = stats.blockedAccounts.toString();
}

function alignRightButton() {
	const rightButton: HTMLElement = document.querySelector(".btn.issue");
	const leftButton = rightButton.parentElement.children[0];
	rightButton.style.left = getComputedStyle(leftButton).width;
}

(function () {
	localizeUI();
	alignRightButton();
	getStats();
})();
