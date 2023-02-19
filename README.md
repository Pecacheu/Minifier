# ChuMinify

## Lightweight minifier for HTML, CSS, and JavaScript

This is a lightweight minifier tool written in Node.js for HTML5, CSS3, and JS, compatible with ES6. I've run into issues in the past with a number of common minifiers, such as producing sub-par results compared to other options, breaking certain functionality, or being incompatible with the latest standards like ES6 JavaScript. So, I've tested a ton of different options and found the best combination of minifiers for these file types, picked some good default config options (these can be adjusted in the main program file), and set 'em loose!

## Usage

PowerShell: `./minify [-o] <in dir> <out dir>`\
Linux: `./minify.sh [-o] <in dir> <out dir>`

The entire contents of `<in dir>` will be copied to `<out dir>` recursively, with any code files minified. The copy operation will be refused if one directory is a subdir of the other, or if `<in dir>` and `<out dir>` are the same.

*Note: This software is bundled with [AutoLoader](https://github.com/Pecacheu/AutoLoader), there's no need to manually install Node.js or any other dependencies!*

### Options

- `-o` Overwrite Files