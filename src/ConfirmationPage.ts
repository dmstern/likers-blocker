export default class ConfirmationPage {
	constructor() {
		const client = typeof browser === "undefined" ? chrome : browser;

		const heading = document.querySelector("form h2");
		if (heading) {
			heading.innerHTML = client.i18n.getMessage("ichbinhier_heading");
		}

		const blockButton = document.querySelector(".btn.btn-danger") as HTMLInputElement;
		if (blockButton) {
			blockButton.value = client.i18n.getMessage("ichbinhier_blockButtonLabel");
		}
	}
}
