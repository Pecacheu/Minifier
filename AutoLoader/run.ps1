#Nodejs AutoLoader, 2023 Pecacheu. GNU GPL v3.0
if($host.version.major -ge 6) {$e="`e[31m";$r="`e[0m"} else {$e=$r=""}

#Handle symlink path
function getLink($fn) {
	$do=$PWD; $t=$fn; do {
		cd (Split-Path -Parent $fn); cd (Split-Path -Parent $t)
		$fn=(Split-Path -Leaf $t)
	} while($t=(Get-Item $fn).Target)
	$fn=Join-Path $PWD $fn; cd $do; $fn
}
function ex() {exit}
if(!($SCR=$PSCommandPath)) {
	$SCR=[Environment]::GetCommandLineArgs()[0];
	function ex() {pause; exit}
}
$SCR=Split-Path -Parent (getLink($SCR)); $DIR=Split-Path -Parent $SCR
$minVer=(Select-String "minVer.+?(\d+)" "$DIR/load.js").Matches.Groups[1].Value
$gyp=Select-String "gyp.+?(\w+)" "$DIR/load.js"; if($gyp) {$gyp=Matches.Groups[1].Value}
function getVer {((node -v) | Select-String "\d+").Matches.Value}

#Check version
if(Get-Command npm 2>$null) {
	$node=getVer; if($node -lt $minVer) {
		"${e}Node v$node is too old! You must have >= $minVer$r"
		Uninstall-Package -Name "Node.js"
		if(Get-Command npm 2>$null) {"${e}Uh oh, uninstall failed!$r"; ex}
		$inst=1
	}
} else {$inst=1}

#Install MS Store apps
function getAppx($pkg) {
	$res=Invoke-WebRequest -Method 'POST' -Uri 'https://store.rg-adguard.net/api/GetFiles' -Body "type=PackageFamilyName&url=$pkg&ring=Retail&lang=en-US" -ContentType 'application/x-www-form-urlencoded' -UseBasicParsing
	$lm=$res.Links | where {$_ -like '*.msix*'} | Select-String -Pattern '(?<=a href=").+(?=" r)'
	$dl=@($lm.matches.Value)
	for($i=1; $i -le $dl.Count; ++$i) {Invoke-WebRequest -Uri $dl[$i-1] -OutFile "$DIR/$pkg($i).msix"}
}

#Install Node
if($inst) {
	winget install -e OpenJS.NodeJS
	if((getVer) -lt $minVer) {"${e}New version v$node is too old!?$r"; ex}
}
if(($gyp -eq "true") -and !(Test-Path "$DIR/node_modules/gyp_test")) {
	if(!(Get-Package "Visual Studio Build Tools 2022")) {
		"Installing VS BuildTools..."
		winget install -e Microsoft.VisualStudio.2022.BuildTools --override "--passive --wait --add Microsoft.VisualStudio.Workload.VCTools;includeRecommended"
		if(!(Get-Package "Visual Studio Build Tools 2022")) {"${e}Install failed!$r"; ex}
	}
	$pkg="PythonSoftwareFoundation.Python.3.10"; $pxt="_qbz5n2kfra8p0"
	if(!(Get-AppxPackage $pkg)) {
		"Installing Python..."
		getAppx("$pkg$pxt"); Invoke-Item "$DIR/$pkg*.msix"
		while($?) {sleep 1; Get-Process "AppInstaller" 2>$null}
		if(!(Get-AppxPackage $pkg)) {"${e}Install failed!$r"; ex}
		Remove-Item "$DIR/$pkg*.msix"
	}
	"Installing node-gyp..."
	npm i -g node-gyp
	if(!$?) {"${e}Install failed!$r"; ex}
	mkdir -f "$DIR/node_modules"; Out-File "$DIR/node_modules/gyp_test"
}
node $SCR/run.mjs $args
if($LastExitCode) {ex}