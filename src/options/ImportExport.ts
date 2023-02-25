import { i18n } from "webextension-polyfill";
import FileManager from "../FileManager";
import icons from "../icons";
import "./import-export.scss";

export default class ImportExport {
	static init() {
		const importListButton = document.querySelector("#importBlockList");
		const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;
		const importStatusMessage = document.querySelector("#importStatusMessage");

		// const includePreviouslyBlocked = document.querySelector(
		// 	"#includePreviouslyBlocked"
		// ) as HTMLInputElement;

		importListButton?.addEventListener("click", () => {
			const errorDetails = importStatusMessage.querySelector(".details");
			const statusMessageSummary = importStatusMessage.querySelector("summary .label");

			importStatusMessage.classList.remove("success", "error", "warning", "info");
			statusMessageSummary.innerHTML = "";
			errorDetails.innerHTML = "";

			FileManager.importBlockList()
				.then(() => {
					importStatusMessage.classList.add("success");
					statusMessageSummary.innerHTML = `${icons.checkmark} ${i18n.getMessage(
						"options_import_success"
					)}`;
				})
				.catch((error: Error) => {
					if (error.message === "empty") {
						importStatusMessage.classList.add("warning");
						statusMessageSummary.innerHTML = `${icons.warn} ${i18n.getMessage("options_import_empty")}`;
					} else {
						importStatusMessage.classList.add("error");
						statusMessageSummary.innerHTML = `${icons.error} ${i18n.getMessage(
							"options_import_error"
						)}`;
						console.error(error);
						errorDetails.innerHTML = error.message;
					}
				})
				.finally(() => {
					setTimeout(() => {
						importStatusMessage.classList.remove("success", "warning", "info");
					}, 5000);
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
