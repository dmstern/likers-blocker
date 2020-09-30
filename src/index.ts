import LikersBlocker from "./LikersBlocker";

declare global {
  interface Window {
    likersBlocker: LikersBlocker;
  }
}

let likersBlocker = window.likersBlocker;

LikersBlocker.run();
