import OptionsStorage from "../storage/OptionsStorage";
import "./ad-block-counter.scss";

export default class AdBlockCounter {
	constructor() {
		const adBlockCount = document.querySelector("#adBlockCount");
		const wrapper = document.querySelector(".ad-block-counter");

		if (!adBlockCount || !wrapper) {
			return;
		}

		OptionsStorage.isAdBlockerActive().then((isAdBlockerActive) => {
			wrapper.classList.toggle("active", isAdBlockerActive);
		});

		OptionsStorage.getBlockedAdsCount().then((blockedAdsCount) => {
			adBlockCount.innerHTML = blockedAdsCount.toString();
		});
	}
}
