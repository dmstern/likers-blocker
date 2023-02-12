import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import sass from "rollup-plugin-sass";
import prettier from "rollup-plugin-prettier";
import eslint from "@rollup/plugin-eslint";
import copy from "rollup-plugin-copy";

const targetFolder = "dist";

const output = {
	dir: targetFolder,
	format: "iife",
};

const plugins = {
	sass: sass({
		output: `${targetFolder}/style.css`,
	}),
	copy: copy({
		targets: [{ src: "assets/*", dest: targetFolder }],
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
		output: {
			...output,
		},
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
