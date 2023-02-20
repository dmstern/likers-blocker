import Exporter from "../Exporter";
import Messenger from "../Messages";
import Storage from "../Storage";
import { QueuedUser } from "../UserInfo";
import "./options.scss";

const disabledClass = "disabled";

const importListButton = document.querySelector("#importBlockList");
importListButton?.addEventListener("click", importBlockList);

Messenger.addQueueUpdateListener(async () => {
	updateDownloadButton();
});

async function updateDownloadButton() {
	const blockedAccounts = await Storage.getBlockedAccounts();
	const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;

	if (!downloadButton) {
		return;
	}

	const { filename, url } = Exporter.prepareDownloadBlockList(blockedAccounts);

	if (blockedAccounts.size > 0) {
		downloadButton.href = url;
		downloadButton.download = filename;
		downloadButton.classList.remove(disabledClass);
	} else {
		downloadButton.removeAttribute("href");
		downloadButton.classList.add(disabledClass);
	}
}

async function importBlockList() {
	console.debug("importBlockList");
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".csv";
	fileInput.style.display = "none";
	document.body.appendChild(fileInput);
	console.debug("fileInput appended");
	fileInput.click();
	fileInput.addEventListener("change", () => {
		console.debug("fileInput change");
		if (!fileInput.files || !fileInput.files[0]) {
			console.debug("not file");
			return;
		}

		const file = fileInput.files[0];
		console.debug(file);
		const reader = new FileReader();
		reader.onload = async (e) => {
			if (!e.target) {
				return;
			}

			// TODO: parse csv to json:
			const text = e.target.result as string;
			console.log("Importing: ");
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
