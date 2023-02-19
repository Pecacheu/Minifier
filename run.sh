#!/bin/bash
#Nodejs AutoLoader v3.6, 2023 Pecacheu. GNU GPL v3
e="\x1b[31m"; r="\x1b[0m"
SCR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"; DIR="$(dirname "$SCR")"
minVer=$(grep -Eo "minVer.+?[0-9]+" "$DIR/load.js" | grep -Eo "[0-9]+" | head -1)
gyp=$(grep -Eo "gyp.+?[0-9a-z]+" "$DIR/load.js" | grep -Eo "[0-9a-z]+" | tail -1)
getVer() {
	node=$(node -v | grep -Eo "[0-9]+" | head -1)
}

#Check version
if type npm &>/dev/null; then
	getVer; if [[ $node < $minVer ]]; then
		echo -e "${e}Node v$node is too old! You must have >= $minVer$r"
		type snap && sudo snap remove node; inst=1
	fi
else inst=1; fi

#Install Node
if [ $inst ]; then
	set -e
	if type apt; then sudo apt install nodejs -y
	elif type pkg; then pkg install nodejs
	elif type pacman; then pacman -S install nodejs
	else echo -e "${e}Sorry, your package manager is not supported.$r"; exit; fi
	npm i -g n; sudo n latest; sudo n prune; getVer
	[[ $node < $minVer ]] && echo -e "${e}New version v$node is too old!?$r" && exit
	set +e
fi
if [[ $gyp == "true" && ! -f "$DIR/node_modules/gyp_test" ]]; then
	echo "Installing node-gyp..."
	sudo npm i -g node-gyp
	[ $? -ne 0 ] && echo -e "${e}Install failed!$r" && exit
	mkdir -p "$DIR/node_modules"; touch "$DIR/node_modules/gyp_test"
fi
node "$SCR/run.mjs" $@