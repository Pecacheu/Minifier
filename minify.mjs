//ChuMinify, Ray 2023. GNU GPL v3
import fs from 'fs/promises'; import html from 'html-minifier-terser';
import * as js from 'terser'; import css from 'clean-css';
import path from 'path'; import {C,msg,err} from './color.mjs';

//Minify Options
const HtmlOpt={
	collapseWhitespace:true, minifyCSS:true, removeAttributeQuotes:true,
	minifyJS:jsm, removeComments:true, log:e => {if(typeof e!='string') throw e}
}, JsOpt={
	format:{}, compress:{ecma:6, unsafe_math:true, unsafe_arrows:true}
}, VER="v1.0";

async function jsm(d,i) {
	JsOpt.format.inline_script=!!i; let c=(await js.minify(d,JsOpt)).code;
	if(c.endsWith(";")) c=c.substr(0,c.length-1); return c;
}
//From Utils.js
Array.prototype.each = function(fn,st,en) {
	let i=st||0,l=this.length,r; if(en) l=en<0?l-en:en;
	for(; i<l; ++i) if((r=fn(this[i],i,l))==='!') this.splice(i--,1),l--;
	else if(r!=null) return r;
}

msg(C.Br+C.Grn+`ChuMinify ${VER} by Pecacheu`);
let FI,FO,Ovr; process.argv.each(n => {
	if(n.startsWith('-')) {
		if(n=='-o') Ovr=1; else err("Unknown option "+n,2);
	} else if(FI) FO=n; else FI=n;
},2);

if(!FI||!FO) err(`Usage: minify [-o] <in dir> <out dir>\n${C.Grn}-o = Overwrite Files`,3);
if(isSubDir(FI,FO)||isSubDir(FO,FI)) err("In dir and out dir cannot be sub directories!",4);
readDir(FI,FO).catch(e => err(e,6));

async function readDir(id,od) {
	await mkdir(od); //Create if not exist
	let d=await fs.readdir(id,{withFileTypes:1}).catch(e =>
		err(e.code=='ENOENT'?id+" is not a valid directory!":e,5));
	let i=0,l=d.length; for(; i<l; ++i) await read(d[i],id,od);
}
async function read(f,fi,fo) {
	fi=path.join(fi,f.name),fo=path.join(fo,f.name);
	if(f.name.startsWith('.')) return msg(C.Blu+"Ignore hidden",fi);
	if(f.isDirectory()) await readDir(fi,fo); //Dir
	else try { //File
		if(!Ovr) { //Check Duplicate
			let fe; try {fe=await fs.stat(fo)} catch(e) {}
			if(fe && !Ovr) throw `File ${fo} exists!`;
		}
		let x=path.extname(f.name);
		if(x=='.html'||x=='.js'||x=='.json'||x=='.css') { //Code
			let fd=await fs.readFile(fi,{encoding:'utf8'}),d;
			if(x=='.html') d=await html.minify(fd,HtmlOpt); else if(x=='.js') d=await jsm(fd);
			else if(x=='.json') d=JSON.stringify(JSON.parse(fd)); else if(x=='.css') {
				d=new css().minify(fd); if(d.errors.length) throw d.errors[0]; d=d.styles;
			}
			await fs.writeFile(fo,d); msg(C.Br+C.Blu+`Minified ${fo} ${C.Ylo+fd.length} -> `+d.length);
		} else await fs.copyFile(fi,fo),msg(C.Di+fo); //Other
	} catch(e) {throw `Error in ${fi}: `+e.stack}
}
function isSubDir(a,b) {
	let rl=path.relative(a,b);
	return !rl||!rl.startsWith('..')&&!path.isAbsolute(rl);
}
async function mkdir(d) {
	try {await fs.stat(d)} catch(e) {
		if(e.code!='ENOENT') throw e;
		await fs.mkdir(d); msg("Wrote Dir",d);
	}
}