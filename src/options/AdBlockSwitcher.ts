import Messenger from "../Messages";
import OptionsStorage from "../storage/OptionsStorage";

export default class AdBlockSwitcher {
	constructor() {
		const adBlockSwitcher = document.querySelector("#adBlockSwitcher") as HTMLInputElement;

		if (!adBlockSwitcher) {
			return;
		}

		OptionsStorage.isAdBlockerActive().then((isAdBlockerActive) => {
			adBlockSwitcher.checked = isAdBlockerActive;
		});

		adBlockSwitcher.addEventListener("change", () => {
			Messenger.sendToggleAdBlocker(adBlockSwitcher.checked);
			OptionsStorage.setAdBlockerActive(adBlockSwitcher.checked);
		});
	}
}
