import { injectIcons } from "../content/icons";
import FileManager from "../FileManager";
import { localizeUI } from "../Localization";
import "./options.scss";

(function () {
	localizeUI();
	injectIcons();

	const importListButton = document.querySelector("#importBlockList");
	const downloadButton = document.querySelector("#downloadBlockList");
	importListButton?.addEventListener("click", FileManager.importBlockList);
	downloadButton.addEventListener("click", FileManager.downloadBlockList);
})();
