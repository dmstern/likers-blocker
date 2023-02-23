import { i18n } from "webextension-polyfill";
import FileManager from "../FileManager";
import icons from "../icons";

export default class ImportExport {
	static init() {
		// Import / export elements:
		const importListButton = document.querySelector("#importBlockList");
		const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;
		const importStatusMessage = document.querySelector("#importStatusMessage");

		// const includePreviouslyBlocked = document.querySelector(
		// 	"#includePreviouslyBlocked"
		// ) as HTMLInputElement;

		importListButton?.addEventListener("click", () => {
			console.log("click import");
			const errorDetails = importStatusMessage.querySelector(".details");
			const statusMessageSummary = importStatusMessage.querySelector("summary .label");

			importStatusMessage.classList.remove("success");
			importStatusMessage.classList.remove("error");
			statusMessageSummary.innerHTML = "";
			errorDetails.innerHTML = "";

			FileManager.importBlockList()
				.then(() => {
					importStatusMessage.classList.add("success");
					statusMessageSummary.innerHTML = `${icons.checkmark} ${i18n.getMessage(
						"options_import_success"
					)}`;
					setTimeout(() => {
						importStatusMessage.classList.remove("success");
					}, 5000);
				})
				.catch((error) => {
					importStatusMessage.classList.add("error");
					statusMessageSummary.innerHTML = `${icons.error} ${i18n.getMessage("options_import_error")}`;
					errorDetails.innerHTML = error;
				});
		});

		downloadButton.addEventListener("click", async () => {
			// const shouldInclude = includePreviouslyBlocked.checked;
			// if (shouldInclude) {
			// 	console.debug("user wants to collect previously blocked account first. return.");
			// 	return;
			// }

			await FileManager.downloadBlockList();
		});

		// includePreviouslyBlocked.addEventListener("click", () => {
		// 	console.log("checkbox change");
		// 	const shouldInclude = includePreviouslyBlocked.checked;

		// 	if (shouldInclude) {
		// 		downloadButton.href = "https://twitter.com/settings/blocked/all";
		// 		downloadButton.target = "_blank";
		// 		downloadButton.removeAttribute("role");
		// 	} else {
		// 		downloadButton.removeAttribute("href");
		// 		downloadButton.removeAttribute("target");
		// 		downloadButton.role = "button";
		// 	}
		// });
	}
}
