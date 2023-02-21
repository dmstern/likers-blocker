import { i18n } from "webextension-polyfill";
import icons, { injectIcons } from "../content/icons";
import FileManager from "../FileManager";
import { localizeUI } from "../Localization";
import "./options.scss";

(function () {
	localizeUI();
	injectIcons();

	const importListButton = document.querySelector("#importBlockList");
	const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;
	const statusMessage = document.querySelector("#statusMessage");
	// const includePreviouslyBlocked = document.querySelector(
	// 	"#includePreviouslyBlocked"
	// ) as HTMLInputElement;
	const errorDetails = statusMessage.querySelector(".details");
	const statusMessageSummary = statusMessage.querySelector("summary .label");

	console.log(statusMessageSummary);

	importListButton?.addEventListener("click", () => {
		statusMessage.classList.remove("success");
		statusMessage.classList.remove("error");
		statusMessageSummary.innerHTML = "";
		errorDetails.innerHTML = "";

		FileManager.importBlockList()
			.then(() => {
				statusMessage.classList.add("success");
				statusMessageSummary.innerHTML = `${icons.checkmark} ${i18n.getMessage(
					"options_import_success"
				)}`;
				setTimeout(() => {
					statusMessage.classList.remove("success");
				}, 5000);
			})
			.catch((error) => {
				statusMessage.classList.add("error");
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
})();
