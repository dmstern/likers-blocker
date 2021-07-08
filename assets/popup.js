"use strict";
const client = typeof browser === "undefined" ? chrome : browser;

function localizeUI() {
	const labelNodes = document.querySelectorAll("[data-label]");
	labelNodes.forEach((element) => {
		const messageName = element.dataset.label;
		const msg = client.i18n.getMessage(messageName);
		element.innerHTML = msg;
	});

	const hrefNodes = document.querySelectorAll("[data-href]");
	hrefNodes.forEach((element) => {
		const messageName = element.dataset.href;
		const msg = client.i18n.getMessage(messageName);
		element.setAttribute("href", msg);
	});
}

function alignRightButton() {
	const rightButton = document.querySelector(".btn.issue");
	const leftButton = rightButton.parentElement.children[0];
	rightButton.style.left = getComputedStyle(leftButton).width;
}

(function() {
	localizeUI();
	alignRightButton();
})();
