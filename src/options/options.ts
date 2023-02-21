import { i18n } from "webextension-polyfill";
import icons, { injectIcons } from "../content/icons";
import FileManager from "../FileManager";
import { localizeUI } from "../Localization";
import settings from "../settings";
import Storage from "../Storage";
import "./options.scss";

// Block speed elements:
const blockSpeedSlider = document.querySelector("#blockSpeed") as HTMLInputElement;
const blockSpeedValueDisplay = blockSpeedSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;

// Scroll speed elements:
const scrollSpeedSlider = document.querySelector("#scrollSpeed") as HTMLInputElement;
const scrollSpeedValueDisplay = scrollSpeedSlider?.parentElement.querySelector(
	".setting__value"
) as HTMLElement;

// Import / export elements:
const importListButton = document.querySelector("#importBlockList");
const downloadButton = document.querySelector("#downloadBlockList") as HTMLAnchorElement;
const importStatusMessage = document.querySelector("#importStatusMessage");

// const includePreviouslyBlocked = document.querySelector(
// 	"#includePreviouslyBlocked"
// ) as HTMLInputElement;

(function () {
	localizeUI();
	injectIcons();

	importListButton?.addEventListener("click", () => {
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

	Storage.getBlocksPerMinute().then((blocksPerMinute) => {
		if (blockSpeedSlider) {
			blockSpeedSlider.min = settings.BLOCKS_PER_MINUTE_MIN.toString();
			blockSpeedSlider.max = settings.BLOCKS_PER_MINUTE_MAX.toString();
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

	Storage.getScrollsPerMinute().then((scrollsPerMinute) => {
		if (scrollSpeedSlider) {
			scrollSpeedSlider.min = settings.SCROLLS_PER_MINUTE_MIN.toString();
			scrollSpeedSlider.max = settings.SCROLLS_PER_MINUTE_MAX.toString();
			scrollSpeedSlider.value = scrollsPerMinute.toString();
			setScrollsPerMinuteValue(scrollsPerMinute);
		}
	});

	scrollSpeedSlider.addEventListener("input", (event) => {
		const value = (event.target as HTMLInputElement).value;
		const scrollsPerMinute = Number.parseInt(value);
		setScrollsPerMinuteValue(scrollsPerMinute);
		Storage.setScrollsPerMinute(scrollsPerMinute);
	});
})();

function setBlocksPerMinuteValue(value: number) {
	if (!blockSpeedValueDisplay) {
		return;
	}
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

function setScrollsPerMinuteValue(value: number) {
	if (!scrollSpeedValueDisplay) {
		return;
	}

	const getHue = () => {
		if (value < settings.SCROLLS_PER_MINUTE_DANGER_ZONE) {
			return 100;
		}

		return value * -1 + 160;
	};

	scrollSpeedValueDisplay.innerHTML = value.toString();
	const statusMessage = scrollSpeedValueDisplay
		.closest(".setting")
		.querySelector(".setting__status-message") as HTMLElement;
	statusMessage?.classList.toggle("warning", value > settings.SCROLLS_PER_MINUTE_DANGER_ZONE);
	scrollSpeedValueDisplay.style.setProperty("--hue", `${getHue()} `);
}
