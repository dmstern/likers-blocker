import Badge from "../Badge";
import { injectIcons } from "../icons";
import { localizeUI } from "../Localization";
import Messenger from "../Messages";
import BlockSpeedSlider from "./BlockSpeedSlider";
import ImportExport from "./ImportExport";
import "./options.scss";
import ScrollSpeedSlider from "./ScrollSpeedSlider";

(function () {
	localizeUI();
	injectIcons();
	ImportExport.init();
	BlockSpeedSlider.init();
	ScrollSpeedSlider.init();
})();

Messenger.onQueueUpdate(async ({ queueLength }) => {
	return Badge.updateBadgeCount(queueLength);
});
