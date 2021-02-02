
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const config = {
	input: 'index.ts',
	output: {
	  file: './dist/npc-utils.js',
	  format: 'umd',
	  name: 'npc-utils',
	  amd: {
		id: 'npc-utils'
	  }
	},
  
	plugins: [
		typescript({
			verbosity: 2,
			clean: true,
		  }),
		commonjs(), resolve(), terser()]
  }
  
  export default config