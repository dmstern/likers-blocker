import LikersBlocker from "./LikersBlocker";
import ConfirmationPage from "./ConfirmationPage";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

LikersBlocker.run();
new ConfirmationPage();
