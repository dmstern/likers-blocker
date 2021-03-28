import LikersBlocker from "./LikersBlocker";

declare global {
	interface Window {
		likersBlocker: LikersBlocker;
	}
}

LikersBlocker.run();
