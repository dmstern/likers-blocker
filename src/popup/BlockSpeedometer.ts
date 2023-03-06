import { i18n, runtime } from "webextension-polyfill";
import "../sass-commons/speedometer-icon.scss";
import settings from "../settings";
import OptionsStorage from "../storage/OptionsStorage";
import Storage from "../storage/Storage";

export default class BlockSpeedometer {
	constructor() {
		this.init();
	}

	private async init() {
		const speedometer = document.querySelector(".block-speedometer") as HTMLElement;
		const label = speedometer.querySelector("[data-label]") as HTMLElement;
		const blockSpeed = await OptionsStorage.getBlocksPerMinute();
		const isBlockerRunning = await Storage.isBlockerRunning();

		document.body.classList.toggle("block-speed-fast", blockSpeed > 30);
		document.body.style.setProperty("--block-speed", blockSpeed.toString());
		document.body.style.setProperty("--block-speed-max", settings.BLOCKS_PER_MINUTE_MAX.toString());
		document.body.classList.toggle("is-blocker-running", isBlockerRunning && blockSpeed > 0);

		if (!speedometer || !label) {
			return;
		}

		speedometer.addEventListener("click", () => {
			runtime.openOptionsPage();
		});

		const labelText = i18n.getMessage(label.dataset.label, blockSpeed.toString());
		if (blockSpeed > 0) {
			label.innerHTML = labelText
				.split(" ")
				.map(
					(word) => `<span class="${/\d/.test(word) ? "block-speedometer__label" : ""}">${word}</span>`
				)
				.join("&nbsp;");
			label.style.setProperty("--hue", `${(blockSpeed * 100) / -60 + 100} `);
		} else {
			label.innerHTML = labelText;
		}
	}
}
