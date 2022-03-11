export default class ConfirmationPage {
	constructor() {
		const client = typeof browser === "undefined" ? chrome : browser;

		const heading = document.querySelector("form h2");
		heading.innerHTML = client.i18n.getMessage("ichbinhier_heading");

		const blockButton = (document.querySelector(".btn.btn-danger") as HTMLInputElement);
		blockButton.value = client.i18n.getMessage("ichbinhier_blockButtonLabel");
	}
}
