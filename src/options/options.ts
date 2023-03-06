import { storage } from "webextension-polyfill";
import Badge from "../Badge";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import OptionsStorage from "../storage/OptionsStorage";
import QueueStorage from "../storage/QueueStorage";
import AdBlockSwitcher from "./AdBlockSwitcher";
import AnimationLevelSlider from "./AnimationLevelSlider";
import BlockSpeedSlider from "./BlockSpeedSlider";
import ImportExport from "./ImportExport";
import "./options.scss";
import ScrollSpeedSlider from "./ScrollSpeedSlider";

function initOptionSettings() {
	new AdBlockSwitcher();
	ImportExport.init();
	BlockSpeedSlider.init();
	AnimationLevelSlider.init();
	ScrollSpeedSlider.init();
}

(function () {
	localizeUI();
	injectIcons();
	initOptionSettings();

	OptionsStorage.getAnimationLevel().then((animationLevel) => {
		document.body.classList.remove(
			"animation-level--off",
			"animation-level--mild",
			"animation-level--frisky"
		);
		document.body.classList.add(`animation-level--${animationLevel}`);
	});

	const resetButton = document.querySelector("#resetButton");
	const clearButton = document.querySelector("#clearButton");

	if (resetButton) {
		resetButton.addEventListener("click", async () => {
			await OptionsStorage.resetSettings();
			initOptionSettings();
		});
	}

	if (clearButton) {
		clearButton.addEventListener("click", async () => {
			await storage.local.clear();
			initOptionSettings();
			const queueLength = await QueueStorage.getQueueLength();
			Badge.updateBadgeCount(queueLength);
		});
	}
})();
