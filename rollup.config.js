import typescript from "@rollup/plugin-typescript";
import {terser} from "rollup-plugin-terser";
import sass from 'rollup-plugin-sass';
import prettier from "rollup-plugin-prettier";
import copy from 'rollup-plugin-copy'

const targetFolder = "dist";

export default {
	input: "src/index.ts",
	output: {
		dir: targetFolder,
		format: "iife"
	},
	plugins: [
		typescript(),
		sass({
			output: `${targetFolder}/style.css`,
		}),
		terser(),
		prettier({
			tabWidth: 2,
			singleQuote: false,
		}),
		copy({
			targets: [{src: "assets/*", dest: targetFolder}],
		}),
	],
};
