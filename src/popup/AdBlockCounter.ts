import Storage from "../Storage";
import "./ad-block-counter.scss";

export default class AdBlockCounter {
	constructor() {
		const adBlockCount = document.querySelector("#adBlockCount");
		const wrapper = document.querySelector(".ad-block-counter");

		if (!adBlockCount || !wrapper) {
			return;
		}

		Storage.isAdBlockerActive().then((isAdBlockerActive) => {
			wrapper.classList.toggle("active", isAdBlockerActive);
		});

		Storage.getBlockedAdsCount().then((blockedAdsCount) => {
			adBlockCount.innerHTML = blockedAdsCount.toString();
		});
	}
}
