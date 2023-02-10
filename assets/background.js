function logURL(e) {
	console.log("Request")
	for (const header of e.requestHeaders) {
		if ((header.name = "authorization") && (header.value.includes("Bearer"))) {
			console.log("saving token")
			client.storage.local.set({ "authorization": header.value })
		}
		const re = /[0-9A-Fa-f]{160}/
		if ((header.name = "x-csrf-token") && re.test(header.value) && (header.value.length == 160)) {
			console.log("saving csfr")
			client.storage.local.set({ "csfr": header.value })
		}

	}
}

browser.webRequest.onBeforeSendHeaders.addListener(
	logURL,
	{ urls: ["<all_urls>"] },
	["requestHeaders"]
);