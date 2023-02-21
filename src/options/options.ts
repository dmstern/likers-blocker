import { i18n } from "webextension-polyfill";
import icons, { injectIcons } from "../content/icons";
import FileManager from "../FileManager";
import { localizeUI } from "../Localization";
import settings from "../settings";
import Storage from "../Storage";
import "./options.scss";

const blockSpeedSlider = document.querySelector("#blockSpeed") as HTMLInputElement;
const blockSpeedValueDisplay = blockSpeedSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;
const importListButton = document.querySelector("#importBlockList");
const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;
const importStatusMessage = document.querySelector("#importStatusMessage");
// const includePreviouslyBlocked = document.querySelector(
// 	"#includePreviouslyBlocked"
// ) as HTMLInputElement;
const errorDetails = importStatusMessage.querySelector(".details");
const statusMessageSummary = importStatusMessage.querySelector("summary .label");

(function () {
	localizeUI();
	injectIcons();

	console.log(statusMessageSummary);

	importListButton?.addEventListener("click", () => {
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

	Storage.getBlocksPerMinute().then((blocksPerMinute) => {
		if (blockSpeedSlider) {
			setBlocksPerMinuteValue(blocksPerMinute);
			blockSpeedSlider.value = blocksPerMinute.toString();
		}
	});

	blockSpeedSlider.addEventListener("input", (event) => {
		const value = (event.target as HTMLInputElement).value;
		const blocksPerMinute = Number.parseInt(value);

		setBlocksPerMinuteValue(blocksPerMinute);
		Storage.setBlocksPerMinute(blocksPerMinute);
	});
})();

function setBlocksPerMinuteValue(value: number) {
	if (blockSpeedValueDisplay) {
		const statusMessage = blockSpeedValueDisplay
			.closest(".setting")
			.querySelector(".setting__status-message") as HTMLElement;
		const statusMessageLabel = statusMessage?.querySelector("[data-label]") as HTMLElement;
		statusMessageLabel.innerHTML = i18n.getMessage(
			statusMessageLabel.dataset.label,
			settings.BLOCKS_PER_MINUTE_DANGER_ZONE.toString()
		);
		statusMessage?.classList.toggle("error", value > settings.BLOCKS_PER_MINUTE_DANGER_ZONE);
		blockSpeedValueDisplay.innerHTML = value.toString();
		blockSpeedValueDisplay.style.setProperty("--hue", `${(value * 100) / -60 + 100} `);
	}
}
