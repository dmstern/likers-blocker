import Storage, { Key } from "../Storage";

const client = typeof browser === "undefined" ? chrome : browser;

function logURL(e) {
	console.log("Request")
	for (const header of e.requestHeaders) {
		if ((header.name = "authorization") && (header.value.includes("Bearer"))) {
			console.log("saving token")
			Storage.set(Key.authorization, header.value);
		}
		const re = /[0-9A-Fa-f]{160}/
		if ((header.name = "x-csrf-token") && re.test(header.value) && (header.value.length == 160)) {
			console.log("saving csfr")
			Storage.set(Key.csfr, header.value);
		}

	}
}

client.webRequest.onBeforeSendHeaders.addListener(
	logURL,
	{ urls: ["<all_urls>"] },
	["requestHeaders"]
);
