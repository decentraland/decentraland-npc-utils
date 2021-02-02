
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'


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
  
	plugins: [commonjs(), resolve(), terser()]
  }
  
  export default config