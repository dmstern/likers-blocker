import { i18n } from "webextension-polyfill";

function replaceData(dataName: string, callback: (element: HTMLElement, message: string) => void) {
	const elements = document.querySelectorAll(`[data-${dataName}]`) as NodeListOf<HTMLElement>;
	elements.forEach((element: HTMLElement) => {
		const messageName = element.dataset[dataName];

		if (!messageName) {
			return;
		}

		callback(element, i18n.getMessage(messageName));
	});
}

export function localizeUI() {
	replaceData("label", (element, message) => {
		element.innerHTML = message;
	});

	replaceData("href", (element, message) => {
		element.setAttribute("href", message);
	});

	replaceData("title", (element, message) => {
		element.setAttribute("title", message);
	});

	replaceData("label-attribute", (element, message) => {
		element.setAttribute("label", message);
	});
}
