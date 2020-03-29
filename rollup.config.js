import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import pkg from "./package.json";

export default [{
  input: "src/bin.js",
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  output: [
    {
      file: pkg.bin.html2latex,
      format: "cjs"
    }
  ],
  plugins: [
    preserveShebangs()
  ]
},
{
  input: "src/convert.js",
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  output: [
    {
      file: pkg.main,
      format: "cjs"
    }
  ]
}];