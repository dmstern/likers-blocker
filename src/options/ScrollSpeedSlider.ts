import settings from "../settings";
import Storage from "../Storage";
import "./scroll-speed-slider.scss";

const scrollSpeedSlider = document.querySelector("#scrollSpeed") as HTMLInputElement;
const scrollSpeedValueDisplay = scrollSpeedSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;

export default class ScrollSpeedSlider {
	static hasEventListener: boolean;

	static init() {
		Storage.getScrollsPerMinute().then((scrollsPerMinute) => {
			if (scrollSpeedSlider) {
				scrollSpeedSlider.min = settings.SCROLLS_PER_MINUTE_MIN.toString();
				scrollSpeedSlider.max = settings.SCROLLS_PER_MINUTE_MAX.toString();
				scrollSpeedSlider.value = scrollsPerMinute.toString();
				setScrollsPerMinuteValue(scrollsPerMinute);
			}
		});

		if (!this.hasEventListener) {
			this.addEventListener();
			this.hasEventListener = true;
		}
	}

	private static addEventListener() {
		scrollSpeedSlider.addEventListener("input", (event) => {
			const value = (event.target as HTMLInputElement).value;
			const scrollsPerMinute = Number.parseInt(value);
			setScrollsPerMinuteValue(scrollsPerMinute);
			Storage.setScrollsPerMinute(scrollsPerMinute);
		});
	}
}

function setScrollsPerMinuteValue(value: number) {
	if (!scrollSpeedValueDisplay) {
		return;
	}

	const getHue = () => {
		if (value < settings.SCROLLS_PER_MINUTE_DANGER_ZONE) {
			return 100;
		}

		return value * -1 + 160;
	};

	scrollSpeedValueDisplay.innerHTML = value.toString();
	const statusMessage = scrollSpeedValueDisplay
		.closest(".setting")
		.querySelector(".setting__status-message") as HTMLElement;
	statusMessage?.classList.toggle("warning", value > settings.SCROLLS_PER_MINUTE_DANGER_ZONE);
	scrollSpeedValueDisplay.style.setProperty("--hue", `${getHue()} `);
}
