import LikersBlocker from "./LikersBlocker";

import "./style.scss";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

LikersBlocker.run();
