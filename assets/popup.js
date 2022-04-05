"use strict";
const client = typeof browser === "undefined" ? chrome : browser;

function localizeUI() {
	const labelNodes = document.querySelectorAll("[data-label]");
	labelNodes.forEach((element) => {
		const messageName = element.dataset.label;
		element.innerHTML = client.i18n.getMessage(messageName);
	});

	const hrefNodes = document.querySelectorAll("[data-href]");
	hrefNodes.forEach((element) => {
		const messageName = element.dataset.href;
		const msg = client.i18n.getMessage(messageName);
		element.setAttribute("href", msg);
	});

	const titleNodes = document.querySelectorAll("[data-title]");
	titleNodes.forEach((element) => {
		const messageName = element.dataset.title;
		const msg = client.i18n.getMessage(messageName);
		element.setAttribute("title", msg);
	});
}

function alignRightButton() {
	const rightButton = document.querySelector(".btn.issue");
	const leftButton = rightButton.parentElement.children[0];
	rightButton.style.left = getComputedStyle(leftButton).width;
}

(function () {
	localizeUI();
	alignRightButton();
})();
