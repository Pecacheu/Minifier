//Nodejs AutoLoader, 2023 Pecacheu. GNU GPL v3
import os from 'os'; import fs from 'fs'; import http from 'http';
import https from 'https'; import {spawn} from 'child_process';
import {dirname} from 'path'; import {fileURLToPath} from 'url';
import {C,msg,err} from './color.mjs'; import conf from '../load.js';
const VER="v4.1.1";

let ind,dir=dirname(dirname(fileURLToPath(import.meta.url)));
const info={ips:getIPList(),dir:dir}, opt=conf.opts;
if(opt.autoInstOptional==null) opt.autoInstOptional=true;
if(!opt.npm || !opt.npm.length) opt.npm=[''];
if(verifyDepends()) conf.main(info); else runJSLoader();

function verifyDepends() {
	getOS(); let v=process.version;
	if(!(Number(v.substr(1,v.indexOf('.')-1)) >= opt.minVer))
		err(`Nodejs ${v} too old, requires >= v${opt.minVer}!`,1);
	if(process.argv.length==3 && process.argv[2]=='.reload') {opt.deleteDir=1;return 0}
	let p=1; for(let n=0,l=opt.npm.length,ns,name; n<l; ++n) {
		ns=opt.npm[n].split(" as "), name=ns[0]; if(ns.length > 1) name=ns[1];
		if(!fs.existsSync(dir+'/node_modules/'+name)) {p=0;break}
	}
	if(opt.wgetPath && !opt.wgetPath.endsWith('/')) opt.wgetPath+='/';
	if(opt.wgetFiles) for(let n=0,l=opt.wgetFiles.length,fn; n<l; ++n) {
		fn=opt.wgetFiles[n]; fn=fn.substr(fn.lastIndexOf('/')+1);
		if(!fs.existsSync(dir+opt.wgetPath+fn)) {p=0;break}
	}
	return p;
}

function runJSLoader() {
	msg(C.Di+`Node AutoLoader ${VER} by Pecacheu\n`+C.Rst+
	`IP: ${info.ips} OS: ${info.os}, ${info.arch}\nCPU: ${info.cpu}*`+
	info.cpus+(opt.debug?"Debug Mode Enabled.":''));
	msg(C.Ylo+"Dependencies Missing!\n"),checkNet(e => {
		if(e) err("No Internet Connection!\n"+e,1);
		if(opt.wgetFiles && opt.wgetFiles.length) {
			msg("Fetching Resources..."); mkDir(dir+opt.wgetPath,1);
			ind=0; get(opt.wgetFiles[ind]);
		} else doInstall();
	});
}
function get(uri) {(uri.startsWith('https:')?https:http).get(uri,httpRes)}
function httpRes(rs) {
	let st=rs.statusCode;
	if(st>=301 && st<=308 && rs.headers.location) return get(rs.headers.location);
	if(st!=200) err("Bad response code "+st,1);
	let fn=opt.wgetFiles[ind]; fn=fn.substr(fn.lastIndexOf('/')+1);
	let file=fs.createWriteStream(dir+opt.wgetPath+fn); rs.pipe(file);
	file.on('finish', () => {
		msg(fn); if(++ind == opt.wgetFiles.length) msg(),doInstall();
		else get(opt.wgetFiles[ind]);
	});
}

function doInstall() {
	if(opt.deleteDir) msg("Deleting Install Directory..."),remDir(dir+"/node_modules");
	if(opt.autoInstOptional && opt.optNpm) Array.prototype.push.apply(opt.npm,opt.optNpm);
	msg("Installing Modules..."),ind=0,installRun();
}
function installRun() {
	if(ind == opt.npm.length) remDir(dir+'/package-lock.json'),
		msg(C.Grn+"Install Complete!"),process.exit();
	let ns=opt.npm[ind].split(" as "),mod=ns[0],inst=mod; if(ns.length > 1) mod=ns[1];
	++ind; if(opt.deleteDir || !fs.existsSync(dir+'/node_modules/'+mod)) {
		msg(C.BgMag+C.Whi+"Installing",mod);
		let cmd=spawn('npm', ['i',inst], {cwd:dir, windowsHide:true, shell:true, stdio:'inherit'});
		cmd.on('error', e => console.error(e));
		cmd.on('close', c => c?err("Install failed!",1):installRun());
	} else msg(C.Di+"Skipping",mod),installRun();
}

function mkDir(p,noDel) {
	if(fs.existsSync(p)) {if(noDel && fs.lstatSync(p).isDirectory()) return; remDir(p)}
	fs.mkdirSync(p);
}
function remDir(p,c) {
	if(!c) {if(p.endsWith('/')) p=p.substr(0,p.length-1); if(!fs.existsSync(p)) return}
	if(!fs.lstatSync(p).isDirectory()) return fs.unlinkSync(p);
	let d=fs.readdirSync(p); for(let s in d) remDir(p+'/'+d[s],1); fs.rmdirSync(p);
}

function checkNet(cb) {https.get('https://google.com',()=>cb()).on('error',cb)}
function getIPList() {
	const ip=[], fl=os.networkInterfaces();
	for(let k in fl) fl[k].forEach(f => {if(!f.internal && f.family=='IPv4'
	&& f.mac!='00:00:00:00:00:00' && f.address) ip.push(f.address)});
	return ip;
}
function getOS() {
	switch(os.platform()) {
		case 'win32': info.os="Windows"; break;
		case 'darwin': info.os="MacOS"; break;
		case 'linux': info.os="Linux"; break;
		default: info.os=os.platform();
	}
	switch(os.arch()) {
		case 'ia32': info.arch="32-bit"; break;
		case 'x64': info.arch="64-bit"; break;
		case 'arm': info.arch="ARM"; break;
		default: info.arch=os.arch();
	}
	let c=os.cpus(); info.cpu=c[0].model;
	info.cpus=c.length;
}