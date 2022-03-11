import LikersBlocker from "./LikersBlocker";
import ConfirmationPage from "./ConfirmationPage";
import "./style.scss";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

LikersBlocker.run();
new ConfirmationPage();
