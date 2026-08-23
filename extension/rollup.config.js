import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
export default {
	external: [ "vscode" ],
	input: "src/index.js",
	output: {
		file: "out/index.js",
		format: "es"
	},
	plugins: [ commonjs(), nodeResolve() ]
}