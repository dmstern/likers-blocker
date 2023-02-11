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
	const statsNode = document.querySelector("#stats");
	const queueNode = document.querySelector("#queue")
	if (statsNode && queueNode) {
		queueNode.innerHTML = stats.blockQueue.toString();
		statsNode.innerHTML = stats.blockedAccounts.toString();
	}
}

function alignRightButton() {
	const rightButton: HTMLElement = document.querySelector(".btn.issue")
	const leftButton = rightButton.parentElement?.children[0]
	rightButton.style.left = getComputedStyle(leftButton).width;
}

async function downloadBlockList() {
	const blockedAccounts = await Storage.getBlockedAccounts();
	const link = document.createElement('a');
	link.style.display = 'none';
	link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(blockedAccounts.join(',\n')));
	link.setAttribute('download', "blocklist.csv");
	document.body.appendChild(link);
	link.click();
	link.remove();
}

async function importBlockList() {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.csv';
	fileInput.style.display = 'none';
	document.body.appendChild(fileInput);
	fileInput.click();
	fileInput.addEventListener('change', async (e) => {
		if (!fileInput.files || !fileInput.files[0]) return
		const file = fileInput.files[0];
		const reader = new FileReader();
		reader.onload = async (e) => {
			if (!e.target) return
			const text = e.target.result as string;
			console.log("Importing: ")
			const blockedAccounts = text.split(',\n');
			await Storage.queueMulti(blockedAccounts);
			await getStats();
		};
		reader.readAsText(file);
		fileInput.remove();
	});
}

document.querySelector("#downloadBlockList").addEventListener("click", downloadBlockList);
document.querySelector("#importBlockList").addEventListener("click", importBlockList);

(function () {
	localizeUI();
	alignRightButton();
	getStats();
})();
