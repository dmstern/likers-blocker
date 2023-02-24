import { i18n } from "webextension-polyfill";
import Messenger from "../Messages";
import settings from "../settings";
import Storage from "../Storage";
import "./block-speed-slider.scss";
import "../sass-commons/speedometer-icon.scss";

const blockSpeedSlider = document.querySelector("#blockSpeed") as HTMLInputElement;
const blockSpeedValueDisplay = blockSpeedSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;

export default class BlockSpeedSlider {
	private static hasEventListener: boolean;

	static init() {
		Storage.getBlocksPerMinute().then((blocksPerMinute) => {
			document.body.style.setProperty("--block-speed-max", settings.BLOCKS_PER_MINUTE_MAX.toString());

			if (blockSpeedSlider) {
				blockSpeedSlider.min = settings.BLOCKS_PER_MINUTE_MIN.toString();
				blockSpeedSlider.max = settings.BLOCKS_PER_MINUTE_MAX.toString();
				setBlocksPerMinuteValue(blocksPerMinute);
				blockSpeedSlider.value = blocksPerMinute.toString();
			}
		});

		if (!this.hasEventListener) {
			this.addEventListener();
			this.hasEventListener = true;
		}
	}
	private static addEventListener() {
		blockSpeedSlider.addEventListener("input", (event) => {
			const value = (event.target as HTMLInputElement).value;
			const blocksPerMinute = Number.parseInt(value);

			setBlocksPerMinuteValue(blocksPerMinute);
			Storage.setBlocksPerMinute(blocksPerMinute);
			Messenger.sendBlockSpeedUpdate();
		});
	}
}

function setBlocksPerMinuteValue(value: number) {
	if (!blockSpeedValueDisplay) {
		return;
	}
	const statusMessage = blockSpeedValueDisplay
		.closest(".setting")
		.querySelector(".setting__status-message") as HTMLElement;
	const statusMessageLabel = statusMessage?.querySelector("[data-label]") as HTMLElement;
	statusMessageLabel.innerHTML = i18n.getMessage(
		statusMessageLabel.dataset.label,
		settings.BLOCKS_PER_MINUTE_DANGER_ZONE.toString()
	);
	document.body.style.setProperty("--block-speed", `${value}`);
	statusMessage?.classList.toggle("error", value > settings.BLOCKS_PER_MINUTE_DANGER_ZONE);
	blockSpeedValueDisplay.innerHTML = value.toString();
	blockSpeedValueDisplay.classList.toggle("setting__value--colored", value > 0);
	blockSpeedValueDisplay.style.setProperty("--hue", `${(value * 100) / -60 + 100} `);
}
