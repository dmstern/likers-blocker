import { injectIcons } from "../content/icons";
import Exporter from "../Exporter";
import { localizeUI } from "../Localization";
import Storage from "../Storage";
import { QueuedUser } from "../UserInfo";
import "./options.scss";

async function importBlockList() {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".csv";
	fileInput.style.display = "none";
	document.body.appendChild(fileInput);
	fileInput.click();
	fileInput.addEventListener("change", () => {
		if (!fileInput.files || !fileInput.files[0]) {
			console.debug("not file");
			return;
		}

		const file = fileInput.files[0];
		const reader = new FileReader();
		reader.onload = async (e) => {
			if (!e.target) {
				return;
			}

			// TODO: parse csv to json:
			const text = e.target.result as string;
			console.log("Importing: ", text);
			const rows = text.split("\n");
			const blockedAccounts: QueuedUser[] = rows.map((row) => {
				const [screen_name, interacted_with] = row.split(",");

				return {
					screen_name,
					interacted_with,
					profile_image_url_https: "",
				};
			});

			await Storage.queueMulti(blockedAccounts);
		};
		reader.readAsText(file);
		fileInput.remove();
	});
}

(function () {
	localizeUI();
	injectIcons();

	const importListButton = document.querySelector("#importBlockList");
	importListButton?.addEventListener("click", importBlockList);
	const downloadButton = document.querySelector("#downloadBlockList");
	downloadButton.addEventListener("click", Exporter.downloadBlockList);
})();
