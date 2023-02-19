//AutoLoader Config
exports.opts = {
	minVer:14, npm:["terser", "clean-css", "html-minifier-terser"]
}
exports.main=() => import('./minify.mjs');