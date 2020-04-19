<h1 align="center" style="border-bottom: none;">HTML-to-Latex</h1>
<h3 align="center">Basic script to convert HTML source into Latex</h3>
<p align="center">
  <a href="https://travis-ci.com/jdalrymple/html-to-latex">
    <img src="https://travis-ci.com/jdalrymple/html-to-latex.svg?branch=master" alt="Travis Pipeline Status">
  </a>
  <a href="https://codeclimate.com/github/jdalrymple/html-to-latex">
    <img src="https://codeclimate.com/github/jdalrymple/html-to-latex/badges/gpa.svg" alt="Code Climate maintainability">
  </a>
  <a href="https://codecov.io/gh/jdalrymple/html-to-latex">
    <img src="https://img.shields.io/codecov/c/github/jdalrymple/html-to-latex/master.svg" alt="CodeCov test coverage">
  </a>
  <a href="https://david-dm.org/jdalrymple/html-to-latex">
    <img src="https://david-dm.org/jdalrymple/html-to-latex/status.svg" alt="Dependency Status" />
  </a>
  <a href="https://david-dm.org/jdalrymple/html-to-latex?type=dev">
    <img src="https://david-dm.org/jdalrymple/html-to-latex/dev-status.svg.svg" alt="Dev Dependency Status" />
  </a>
  <img src="https://flat.badgen.net/dependabot/jdalrymple/html-to-latex?icon=dependabot" alt="Dependabot Badge" />
  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen">
  </a>
  <img src="https://img.shields.io/badge/code%20style-prettier-ff69b4.svg" alt="Prettier">
  <a href="https://packagephobia.now.sh/result?p=html-to-latex">
    <img src="https://packagephobia.now.sh/badge?p=html-to-latex" alt="Install Size">
  </a>
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Licence: MIT">
  </a>
</p>

**[IN DEVELOPMENT]**

## Install

```bash
$ npm install html-to-latex
```

## Usage

Converting html text:
```javascript
import { convertText } from 'html-to-latex';

const html = `<p>Styled <b>Text</b></p>`;
const tex = await convertText(html);

console.log(tex)
//\documentclass{article}
//
//\begin{document}
//
//Styled \textbf{Text}
//
//\end{document}
```

Converting html file:
```javascript
import { convertFile } from 'html-to-latex';

const html = 'filePath.html';

await convertFile(html);
```

### API

#### convertText(htmlText, options?)

Returns: `Promise<string>`

Converts the input htmlText to a valid latex string. 

##### htmlString

Type: `string`

##### options

Type: `object`

###### ignoreBreaks

Type: `boolean`
Default: `true`
CLI Options: `-ib` or `--ignore-breaks`

Instead of replacing `<br/>`  with //, ending the line, a simple space character is inserted instead.

###### preferDollarInlineMath

Type: `boolean`
Default: `false`
CLI Options: `-dm` or `--prefer-dollar-inline-math`

Replace `\(` and `\)`  with `$`.

###### skipWrappingEquations

Type: `boolean`
Default: `false`
CLI Options: `-swe` or  `--skip-wrapping-equations`

Is an equation is defined in a `p` tag without any other content besides that equation, it will automatically be wrapped in `\[` and `\]`.

###### includeDocumentWrapper

Type: `boolean`
Default: `false`
CLI Options: `-dw` or  `--include-document-wrapper`

Adds a latex document wrapper around the converted text. This is required to have a valid latex file:

```latex
\documentclass{article}

\begin{document}
%...converted text
\end{document}
```

###### documentClass

Type: `string`
Default: `article`
CLI Options: `-dc` or  `--document-class`

If a document wrapper is added, the document class will be set.

```latex
\documentclass{article}
%...
```

###### includePackages

Type: `string[]`
Default: `[]`*
CLI Options: `-ip` or  `--include-packages`

If the document wrapper is added, a list of used packages will be set.

```latex
\documentclass{article}

\usepackage{packagename}

\begin{document}
%...converted text
\end{document}
```

\*If nothing is specified, the list of includes packages will be inferred from the html:


| Tag    | Added Package |
|--------|---------------|
| \cfrac | amsmath       |
| \img   | graphicx      |
| \therefore | amssymb   |

###### title

Type: `string`
Default: `undefined`
CLI Options: `-t` or  `--title`

If a document wrapper is added, the title will be set.

```latex
\documentclass{article}

\title{Altered Carbon}

\begin{document}
%...converted text
\end{document}
```

###### author

Type: `string`
Default: `undefined`
CLI Options: `-a` or  `--author`

If a document wrapper is added, the author will be set.

```latex
\documentclass{article}

\author{Takashi Kovacs}

\begin{document}
%...converted text
\end{document}
```

###### includeDate

Type: `boolean`
Default: `false`
CLI Options: `-d` or  `--incude-date`

If a document wrapper is added, the current date will be set.

```latex
\documentclass{article}

\date{\today}

\begin{document}
%...converted text
\end{document}
```

###### compilationDir

Type: `string`
Default: `process.cwd`
CLI Options: `-cdr` or `--compilation-dir`

If any images need to be downloaded for the latex compilation, they will be places in a 'images' subdirectory inside this directory.

###### autoGenImageNames

Type: `boolean`
Default: `true`
CLI Options: `-ain` or `--autogen-image-names`

To avoid any weird file names, image files that are downloaded are automatically given a random Id with the extension of the original file. This can be turned off by passing a `false` value.

###### imageWidth

Type: `string`
Default: `undefined`
CLI Options: `-iw` or `--image-width`

Allows you to set a image width. This would be in the form normally accepted by latex such as: `2cm`

###### imageHeight

Type: `string`
Default: `undefined`
CLI Options: `-ih` or `--image-height`

Allows you to set a image height. This would be in the form normally accepted by latex such as: `2cm`

###### keepImageAspectRatio

Type: `boolean`
Default: `undefined`
CLI Options: `-kar` or `--keep-aspect-ratio`

Allows you to maintain the aspect ratio of the image. This also requires either the image width property or image height property to be set.

###### debug

Type: `boolean`
Default: `false`
CLI Options: `--debug`

Prints error messages when they occur such as when an image cannot be found at the given url.


#### convertFile(filepath, options?)
CLI: `available` (see options for cli option names)
Returns: `Promise`

Converts the input file to a valid latex file. 

##### filepath

Type: `string`
CLI Option: Positional, or `-ifp`

Path of html file

##### options

Type: `object`

All options included in .... and

*includeDocumentWrapper option is defaulted to true for this function, as it would make more sense to do so*

##### outputFilepath

Type: `string`
Default: `filepath` (The input file path)
CLI Option: `-ofp` or `--output-file-path`

The output filepath of the converted file. By default it will overwrite the input file.

### CLI API
The same arguments are valid for the cli. The cli is exposed under html-to-latex executable and has the functions: `convert-file` and `convert-text`. Run `html-to-latex --help` for more information.

## Improving output
### Ignoring br tags
Instead designate new sections/paragraphs using the proper html tag such as a `<p>`
