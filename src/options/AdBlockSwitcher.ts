import Messenger from "../Messages";
import Storage from "../Storage";

export default class AdBlockSwitcher {
	constructor() {
		const adBlockSwitcher = document.querySelector("#adBlockSwitcher") as HTMLInputElement;

		if (!adBlockSwitcher) {
			return;
		}

		Storage.isAdBlockerActive().then((isAdBlockerActive) => {
			adBlockSwitcher.checked = isAdBlockerActive;
		});

		adBlockSwitcher.addEventListener("change", () => {
			Messenger.sendToggleAdBlocker(adBlockSwitcher.checked);
			Storage.setAdBlockerActive(adBlockSwitcher.checked);
		});
	}
}
