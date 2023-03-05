import OptionsStorage, { AnimationLevel, animationLevelValues } from "../storage/OptionsStorage";
import "./animation-level-slider.scss";

const animationLevelSlider = document.querySelector("#animationLevel") as HTMLInputElement;
const settingWrapper = animationLevelSlider.closest(".setting");
const animationLevelValueDisplay = animationLevelSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;

export default class AnimationLevelSlider {
	private static hasEventListener: boolean;

	static init() {
		OptionsStorage.getAnimationLevel().then((animationLevel) => {
			if (animationLevelSlider) {
				animationLevelSlider.value = animationLevelValues[animationLevel].toString();
				this.setValues(animationLevelValues[animationLevel], animationLevel);
			}
		});

		if (!this.hasEventListener) {
			this.addEventListener();
			this.hasEventListener = true;
		}
	}
	static setStateClass(level: AnimationLevel) {
		settingWrapper.classList.remove(
			"animation-level-slider--off",
			"animation-level-slider--mild",
			"animation-level-slider--frisky"
		);
		settingWrapper.classList.add(`animation-level-slider--${level}`);
	}

	private static addEventListener() {
		animationLevelSlider.addEventListener("input", (event) => {
			const value = Number.parseInt((event.target as HTMLInputElement).value);
			const [animationLevelLabel] = Object.entries(animationLevelValues).find(
				([, currentAnimationLevelValue]) => value === currentAnimationLevelValue
			);
			const animationLevel = AnimationLevel[animationLevelLabel];

			OptionsStorage.setAnimationLevel(animationLevel);
			this.setValues(value, animationLevel);
		});
	}

	private static setValues(value: number, animationLevel: AnimationLevel) {
		animationLevelValueDisplay.classList.toggle("setting__value--colored", value > -1);
		animationLevelValueDisplay.title = animationLevel;

		this.setStateClass(animationLevel);
	}
}
