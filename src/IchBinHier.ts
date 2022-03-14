const client = typeof browser === "undefined" ? chrome : browser;

export default class IchBinHier {
	constructor() {
		this.setUpConfirmationPage();
		this.setUpLoginPage();
	}

	setUpConfirmationPage() {
		const heading = document.querySelector("form h2");
		if (heading) {
			heading.innerHTML = client.i18n.getMessage("ichbinhier_heading");
		}

		const blockButton = document.querySelector(".btn.btn-danger") as HTMLInputElement;
		if (blockButton) {
			blockButton.value = client.i18n.getMessage("ichbinhier_blockButtonLabel");
		}
	}

	setUpLoginPage() {
		const isLoginPage =
			document.querySelectorAll("body > .container > .row > .col-md-8 > a").length === 2;

		console.log(isLoginPage);

		if (!isLoginPage) {
			return;
		}
		document.querySelectorAll("p").forEach((p) => {
			p.parentNode.removeChild(p);
		});

		const newP1 = document.createElement("p");
		const newP2 = document.createElement("p");
		newP1.innerHTML = `
			${client.i18n.getMessage("ichbinhier_privacyInfo")}
			${client.i18n.getMessage("ichbinhier_pivacyInfoHeroku")}
			<a href="https://www.salesforce.com/company/privacy/" target="_blank">${client.i18n.getMessage(
				"ichbinhier_pivacyInfoHerokuLinkLabel"
			)}</a>.`;
		newP2.innerHTML = `
			${client.i18n.getMessage("ichbinhier_repoInfo")}
			<a href="https://github.com/pkreissel/ichbinhier_twittertools" target="_blank">Github</a>.`;

		const container = document.querySelector("body > .container:nth-child(2)");
		container.append(newP1, newP2);
	}
}
