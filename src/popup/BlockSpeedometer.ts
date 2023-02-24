import { i18n } from "webextension-polyfill";
import Storage from "../Storage";

export default class BlockSpeedometer {
	constructor() {
		this.init();
	}

	private async init() {
		const speedometer = document.querySelector(".block-speedometer") as HTMLElement;
		const label = speedometer.querySelector("[data-label]") as HTMLElement;
		const main = document.querySelector("main") as HTMLElement;
		const blockSpeed = await Storage.getBlocksPerMinute();

		if (main) {
			main.style.setProperty("--block-speed", blockSpeed.toString());
			main.classList.toggle("blocker-sleeping", blockSpeed < 1);
		}

		if (speedometer && label) {
			label.innerHTML = i18n.getMessage(label.dataset.label, blockSpeed.toString());
		}
	}
}
