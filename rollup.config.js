import eslint from "@rollup/plugin-eslint";
import typescript from "@rollup/plugin-typescript";
import { writeFileSync } from "fs";
import copy from "rollup-plugin-copy";
import prettier from "rollup-plugin-prettier";
import sass from "rollup-plugin-sass";
import { terser } from "rollup-plugin-terser";

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
			writeFileSync(`${chromeTargetFolder}/${filename}.css`, styles);
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
		prettier({
			tabWidth: 2,
			singleQuote: false,
		}),
		eslint({
			include: ["src/**/*.ts"],
		}),
	],
};

if (process.env.NODE_ENV === "production") {
	plugins.commons.push(terser());
}

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
		plugins: [
			...plugins.commons,
			sassPlugin("popup"),
			copy({
				targets: [
					{ src: "src/popup/popup.html", dest: targetFolder },
					{ src: "src/popup/popup.html", dest: chromeTargetFolder },
				],
			}),
		],
	},
	{
		external: ["webextension-polyfill"],
		input: "src/options/options.ts",
		output,
		plugins: [
			...plugins.commons,
			sassPlugin("options"),
			copy({
				targets: [
					{ src: "src/options/options.html", dest: targetFolder },
					{ src: "src/options/options.html", dest: chromeTargetFolder },
				],
			}),
		],
	},
];

export default config;
