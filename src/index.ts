import LikersBlocker from "./LikersBlocker";
import IchBinHier from "./IchBinHier";
import "./style.scss";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

LikersBlocker.run();
new IchBinHier();
