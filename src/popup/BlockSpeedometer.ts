import { i18n } from "webextension-polyfill";
import Storage from "../Storage";

export default class BlockSpeedometer {
	constructor() {
		this.init();
	}

	private async init() {
		const speedometer = document.querySelector(".block-speedometer") as HTMLElement;
		const label = speedometer.querySelector("[data-label]") as HTMLElement;

		if (speedometer && label) {
			const blockSpeed = await Storage.getBlocksPerMinute();
			label.innerHTML = i18n.getMessage(label.dataset.label, blockSpeed.toString());
		}
	}
}
