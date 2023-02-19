import typescript from "@rollup/plugin-typescript";
// import { terser } from "rollup-plugin-terser";
import sass from "rollup-plugin-sass";
import prettier from "rollup-plugin-prettier";
import eslint from "@rollup/plugin-eslint";
import copy from "rollup-plugin-copy";
import { writeFileSync } from "fs";

const targetFolder = "dist";
const chromeTargetFolder = "dist_chrome";

const output = [
	{
		dir: targetFolder,
		format: "iife",
		globals: {
			"webextension-polyfill": "browser",
		},
	},
	{
		dir: chromeTargetFolder,
		format: "iife",
		globals: {
			"webextension-polyfill": "chrome",
		},
	},
];

function sassPlugin(filename) {
	return sass({
		output: (styles) => {
			writeFileSync(`${targetFolder}/${filename}.css`, styles);
			writeFileSync(`${chromeTargetFolder}/${filename}`, styles);
		},
	});
}

const plugins = {
	copy: copy({
		targets: [
			{ src: "node_modules/webextension-polyfill/dist/browser-polyfill.js", dest: targetFolder },
			{ src: "node_modules/webextension-polyfill/dist/browser-polyfill.js", dest: chromeTargetFolder },
			{ src: "assets/*", dest: targetFolder },
			{ src: "assets/*", dest: chromeTargetFolder },
			{
				src: "assets/manifest.json",
				dest: chromeTargetFolder,
				transform: (contents, filename) => {
					if (filename.includes("manifest.json")) {
						const manifest = JSON.parse(contents.toString());
						manifest.background = {
							service_worker: "background.js",
							type: "module",
						};
						return JSON.stringify(manifest, null, 2);
					}
				},
			},
		],
	}),
	commons: [
		typescript(),
		// terser(),
		prettier({
			tabWidth: 2,
			singleQuote: false,
		}),
		eslint({
			include: ["src/**/*.ts"],
		}),
	],
};

const config = [
	{
		external: ["webextension-polyfill"],
		input: "src/content/index.ts",
		output,
		plugins: [...plugins.commons, sassPlugin("style"), plugins.copy],
	},
	{
		external: ["webextension-polyfill"],
		input: "src/background/background.ts",
		output,
		plugins: [...plugins.commons],
	},
	{
		external: ["webextension-polyfill"],
		input: "src/popup/popup.ts",
		output,
		plugins: [...plugins.commons, sassPlugin("popup")],
	},
	{
		external: ["webextension-polyfill"],
		input: "src/options/options.ts",
		output,
		plugins: [...plugins.commons, sassPlugin("options")],
	},
];

export default config;
