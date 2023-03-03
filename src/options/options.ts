import { storage } from "webextension-polyfill";
import Badge from "../Badge";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import Storage, { Key } from "../Storage";
import AdBlockSwitcher from "./AdBlockSwitcher";
import BlockSpeedSlider from "./BlockSpeedSlider";
import ImportExport from "./ImportExport";
import "./options.scss";
import ScrollSpeedSlider from "./ScrollSpeedSlider";
import AnimationLevelSlider from "./AnimationLevelSlider";

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

	const resetButton = document.querySelector("#resetButton");
	const clearButton = document.querySelector("#clearButton");

	if (resetButton) {
		resetButton.addEventListener("click", async () => {
			await Storage.remove(Key.blocksPerMinute, false);
			await Storage.remove(Key.scrollsPerMinute, false);
			await Storage.remove(Key.animationLevel, false);
			await Storage.remove(Key.adBlockerActive, false);
			initOptionSettings();
		});
	}

	if (clearButton) {
		clearButton.addEventListener("click", async () => {
			await storage.local.clear();
			initOptionSettings();
			const queueLength = await Storage.getQueueLength();
			Badge.updateBadgeCount(queueLength);
		});
	}
})();
