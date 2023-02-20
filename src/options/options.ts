import { i18n } from "webextension-polyfill";
import icons, { injectIcons } from "../content/icons";
import FileManager from "../FileManager";
import { localizeUI } from "../Localization";
import "./options.scss";

(function () {
	localizeUI();
	injectIcons();

	const importListButton = document.querySelector("#importBlockList");
	const downloadButton = document.querySelector("#downloadBlockList");
	const statusMessage = document.querySelector("#statusMessage");
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

	downloadButton.addEventListener("click", FileManager.downloadBlockList);
})();
