import { runtime } from "webextension-polyfill";
import Badge from "../Badge";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import Messenger from "../Messages";
import BlockMachine from "./BlockMachine";
import BlockSpeedometer from "./BlockSpeedometer";
import LoginDisplay from "./LoginDisplay";
import "./popup.scss";
import Stats from "./Stats";

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
	new LoginDisplay();
	new BlockSpeedometer();

	Stats.update();
	BlockMachine.init();

	const optionsButton = document.querySelector("#options");
	optionsButton?.addEventListener("click", () => {
		runtime.openOptionsPage();
	});

	Messenger.onQueueUpdate(async ({ queueLength }) => {
		console.debug("📫 Popup: QueueUpdate Message");
		Stats.update();

		Badge.updateBadgeCount(queueLength);
	});

	Messenger.onBlock(async ({ success, status }) => {
		if (success) {
			await BlockMachine.runBlockAnimation();
		} else {
			BlockMachine.runFailAnimation(status);
		}
	});
})();
