import { runtime } from "webextension-polyfill";

export function injectFonts() {
	const fontStyleElement = document.createElement("style");
	fontStyleElement.textContent = `
	@font-face {
		font-family: Pixel;
		font-weight: 400;
		src: local("MineCraft"), url("${runtime.getURL(
			"fonts/MinecraftRegular.otf"
		)}") format("opentype"), url("${runtime.getURL("fonts/advanced_pixel-7.ttf")}") format("truetype");
	}
	
	@font-face {
		font-family: Pixel;
		font-weight: 700;
		src: local("MineCraft"), url("${runtime.getURL(
			"fonts/MinecraftBold.otf"
		)}") format("opentype"), url("${runtime.getURL("fonts/advanced_pixel-7.ttf")}") format("truetype");
	}`;

	document.head.appendChild(fontStyleElement);
}
