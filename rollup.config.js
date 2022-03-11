import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import sass from 'rollup-plugin-sass';
import prettier from "rollup-plugin-prettier";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "iife"
  },
  plugins: [
		typescript(),
		sass({
			output: "dist/style.css",
		}),
		terser(),
		prettier({
			tabWidth: 2,
			singleQuote: false,
		}),
	]
};
