import { runtime } from "webextension-polyfill";
import Badge from "../Badge";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import Messenger from "../Messages";
import OptionsStorage, { AnimationLevel } from "../storage/OptionsStorage";
import Storage from "../storage/Storage";
import AdBlockCounter from "./AdBlockCounter";
import BlockLimit from "./BlockLimit";
import BlockMachine from "./BlockMachine";
import BlockSpeedometer from "./BlockSpeedometer";
import LoginDisplay from "./LoginDisplay";
import "./popup.scss";
import Stats from "./Stats";

let popupAnimationLevel: AnimationLevel;

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
	new AdBlockCounter();
	const blockLimit = new BlockLimit();
	Stats.update();

	const versionElement = document.querySelector("#extensionVersion") as HTMLElement;
	if (versionElement) {
		versionElement.innerHTML = `v${runtime.getManifest().version}`;
	}

	OptionsStorage.getAnimationLevel().then((animationLevel) => {
		document.body.classList.remove(
			"animation-level--off",
			"animation-level--mild",
			"animation-level--frisky"
		);
		document.body.classList.add(`animation-level--${animationLevel}`);
		popupAnimationLevel = animationLevel;
		if (animationLevel === AnimationLevel.frisky) {
			BlockMachine.init();
		}
	});

	const optionsButton = document.querySelector("#options");
	optionsButton?.addEventListener("click", () => {
		runtime.openOptionsPage();
	});

	Messenger.onQueueUpdate(async ({ queueLength }) => {
		// console.debug("📫 Popup: QueueUpdate Message");
		Stats.update();

		Badge.updateBadgeCount(queueLength);
	});

	Messenger.onBlock(async ({ success, status }) => {
		Stats.update();

		if (popupAnimationLevel !== AnimationLevel.frisky) {
			return;
		}

		if (success) {
			await BlockMachine.runBlockAnimation();
			blockLimit.fillLevelUpdate();
		} else {
			BlockMachine.runFailAnimation(status);
		}
	});

	Storage.getScreenshotMode().then((isScreenshotMode: boolean) => {
		document.body.classList.toggle("screenshot-blur", isScreenshotMode);
	});

	const instructions = document.querySelector(".instructions") as HTMLElement;

	if (instructions) {
		const a = document.createElement("a");
		const imageUrl = runtime.getURL("likers-blocker-collecting-and-confirm-animation--tweet.gif");
		a.href = imageUrl;
		a.target = "_target";
		a.classList.add("instructions__image-wrapper");
		a.innerHTML = `<img src="${imageUrl}" />`;
		instructions.querySelector("li:first-child")?.append(a);
	}
})();
