import { i18n } from "webextension-polyfill";
import settings from "../settings";
import BlockListStorage from "../storage/BlockListStorage";
import "./block-limit.scss";

export default class BlockLimit {
	blockLimit: HTMLElement;
	fillLevel: number;

	constructor() {
		this.blockLimit = document.querySelector(".block-limit") as HTMLElement;
		this.fillLevelUpdate();
	}

	fillLevelUpdate() {
		BlockListStorage.getCurrentBlocksCount().then((currentBlocksCount) => {
			this.fillLevel = 1 - currentBlocksCount / settings.BLOCKS_PER_SESSION_LIMIT;

			if (!this.blockLimit) {
				return;
			}

			const label = this.blockLimit.querySelector("[data-label]") as HTMLElement;
			const messageKey = label?.dataset.label;
			label.innerHTML = i18n.getMessage(
				messageKey,
				(settings.BLOCKS_PER_SESSION_LIMIT - currentBlocksCount).toString()
			);
			this.blockLimit.style.setProperty("--fill-level", (this.fillLevel * 100).toString());
		});
	}
}
