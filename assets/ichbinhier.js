class IchBinHier {
	constructor() {
		this.client = "undefined" == typeof browser ? chrome : browser;

		this.icons = {
			Home: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
			Login: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>`,
			Logout: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>`,
		};

		this.setUpLoginPage();
		this.setUpHeader();
		this.setUpMain();
		this.setUpConfirmationPage();
	}

	setUpConfirmationPage() {
		const heading = document.querySelector("form h2");
		if (heading) {
			heading.innerHTML = this.client.i18n.getMessage("ichbinhier_heading");
		}

		const blockButton = document.querySelector(".btn.btn-danger");
		if (blockButton) {
			blockButton.classList.add("block-button");
			blockButton.value = this.client.i18n.getMessage("ichbinhier_blockButtonLabel");
			blockButton.setAttribute("onclick", "");
			blockButton.setAttribute("type", "submit");
		}

		const form = document.querySelector(".container form");
		if (form) {
			const formMarkup = form.outerHTML;
			form.parentElement.innerHTML = `
				<div class="row">
					<div class="col-12">
						${formMarkup}
					</div>
				</div>`;
		}
	}

	setUpHeader() {
		const nav = Array.from(document.querySelectorAll("body > .container > .row > .col-md-8 > a"));
		const originalContainer = document.querySelector(".container");
		const header = document.createElement("header");

		header.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <ul class="navbar-nav mr-auto col-12">
          	${nav
							.map(
								(item) =>
									`<li class="nav-item">
										<a class="nav-link" href="${item.href}">
											${this.getIcon(item.innerHTML)}
											<span>${item.innerHTML}</span>
										</a>
									</li>`
							)
							.join("")}
          </ul>
        </div>
      </nav>`;

		document.body.removeChild(originalContainer);
		document.body.prepend(header);
	}

	setUpLoginPage() {
		const isLoginPage =
			document.querySelectorAll("body > .container > .row > .col-md-8 > a").length === 2;

		if (!isLoginPage) {
			return;
		}

		document.querySelectorAll("p").forEach((p) => {
			p.parentNode.removeChild(p);
		});

		const newP1 = document.createElement("p");
		const newP2 = document.createElement("p");
		newP1.innerHTML = `
			${this.client.i18n.getMessage("ichbinhier_privacyInfo")}
			${this.client.i18n.getMessage("ichbinhier_pivacyInfoHeroku")}
			<a href="https://www.salesforce.com/company/privacy/" target="_blank">${this.client.i18n.getMessage(
				"ichbinhier_pivacyInfoHerokuLinkLabel"
			)}</a>.`;
		newP2.innerHTML = `
			${this.client.i18n.getMessage("ichbinhier_repoInfo")}
			<a href="https://github.com/pkreissel/ichbinhier_twittertools" target="_blank">Github</a>.`;

		const container = document.querySelector("body > .container:nth-child(2)");
		container.append(newP1, newP2);
	}

	getIcon(label) {
		return Object.keys(this.icons).includes(label) ? this.icons[label] : "";
	}

	setUpMain() {
		const main = document.createElement("main");
		const originalContainer = document.querySelector(".container:nth-child(2)");
		main.innerHTML = `<div class="container">${originalContainer.innerHTML}</div>`;

		const output = document.getElementById("output");
		if (output) {
			main.append(output);
		}

		document.body.removeChild(originalContainer);
		document.body.append(main);
	}
}

new IchBinHier();
