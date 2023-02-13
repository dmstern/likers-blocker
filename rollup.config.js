import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import sass from "rollup-plugin-sass";
import prettier from "rollup-plugin-prettier";
import eslint from "@rollup/plugin-eslint";
import copy from "rollup-plugin-copy";
import { writeFileSync } from "fs";

const targetFolder = "dist";
const chromeTargetFolder = "dist_chrome";

const output = [{
	dir: targetFolder,
	format: "iife",
}, {
	dir: chromeTargetFolder,
	format: "iife",
}];

const plugins = {
	sass: sass({
		output: (styles) => {
			writeFileSync(`${targetFolder}/style.css`, styles);
			writeFileSync(`${chromeTargetFolder}/style.css`, styles);
		}
	}),
	copy: copy({
		targets: [
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
						};
						return JSON.stringify(manifest, null, 2);
					}
				}
			}]
	}),
	commons: [
		typescript(),
		terser(),
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
		input: "src/content/index.ts",
		output,
		plugins: [...plugins.commons, plugins.sass, plugins.copy],
	},
	{
		input: "src/background/background.ts",
		output,
		plugins: [...plugins.commons],
	},
	{
		input: "src/popup/popup.ts",
		output,
		plugins: [...plugins.commons],
	},
];

export default config;
