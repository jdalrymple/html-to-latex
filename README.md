<h1 align="center" style="border-bottom: none;">HTML-to-Latex</h1>
<p align="center">
  <a href="https://github.com/jdalrymple/html-to-latex/actions/workflows/pipeline.yml"><img alt="pipeline status" src="https://github.com/jdalrymple/html-to-latex/actions/workflows/pipeline.yml/badge.svg"/></a>
  <a href="https://codeclimate.com/github/jdalrymple/html-to-latex/test_coverage"><img src="https://api.codeclimate.com/v1/badges/c7b735f086fce0200e96/test_coverage" /></a>
  <a href="https://codeclimate.com/github/jdalrymple/html-to-latex/maintainability"><img src="https://api.codeclimate.com/v1/badges/c7b735f086fce0200e96/maintainability" alt="Code Climate maintainability"> /></a>
  <a href="https://github.com/intuit/auto">
    <img src="https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto" alt="Auto">
  </a>
  <a href="#contributors-">
    <img src="https://img.shields.io/badge/all_contributors-orange.svg?style=round" alt="All Contributors" />
  </a>
  <img src="https://img.shields.io/badge/code%20style-prettier-ff69b4.svg" alt="Prettier">
  <a href="https://packagephobia.now.sh/result?p=html-to-latex">
    <img src="https://packagephobia.now.sh/badge?p=html-to-latex" alt="Install Size">
  </a>
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Licence: MIT">
  </a>
</p>

> A basic library for converting HTML source into Latex.

## Table of Contents

- [Usage](#usage)
- [API](#api)
- [FAQ](#faq)
- [Contributors](#contributors)
- [Changelog](./CHANGELOG.md)

## Features

- **Universal** - Works in all modern browsers, [Node.js](https://nodejs.org/), and [Deno](https://deno.land/) and supports CLI usage.
- **Tiny Size** - 12.5kb packed, 65.5kb unpacked.
- **Tested** - Greater than 98% test coverage.
- **Typed** - Out of the box TypeScript declarations.

## Usage

<table>
<tbody valign=top align=left>
<tr>
<th>Browsers</th>
<td width=100%>
Load <code>html-to-latex</code> directly from <a href="https://esm.sh">esm.sh</a>

```html
<script type="module">
  import { convertText, convertFile } from 'https://esm.sh/html-to-latex';
</script>
```

</td>
</tr>
<tr>
<th>Deno</th>
<td width=100%>
Load <code>html-to-latex</code> directly from <a href="https://esm.sh">esm.sh</a>

```ts
import { convertText, convertFile } from 'https://esm.sh/html-to-latex?dts';
```

</td>
</tr>
<tr>
<th>Node 18+</th>
<td>

Install with <code>npm install html-to-latex</code>, <code>yarn add html-to-latex</code>, or <code>pnpm add html-to-latex</code>

```js
import { convertText, convertFile } from 'html-to-latex';
```

OR as a CLI,

Run with <code>npx</code>, <code>yarn dlx</code> or <code>pnpm dlx</code>

```bash
html-to-latex [function name] positional_arg --opts_arg1 --opts_argN

# A shorthand can also be used:
h2l [function name] positional_arg --opts_arg1 --opts_argN
```

</td>
</tr>
</tbody>
</table>

## API

### `async convertText(htmlText:string, options?:Record<string,unknown>): Promise<string>`

Converts the input htmlText to a valid latex string.

| Name                                                                      | Type       | Optional | Default       | Description                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ---------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `htmlText`                                                                | `string`   | No       | N/A           | Converts the input htmlText to a valid latex string.                                                                                                                                                                                                        |
| `options.ignoreBreaks` (`-ib` or `--ignore-breaks`)                       | `boolean`  | Yes      | `true`        | Instead of replacing `<br/>` with //, ending the line, a simple space character is inserted instead.                                                                                                                                                        |
| `options.preferDollarInlineMath` (`-dm` or `--prefer-dollar-inline-math`) | `boolean`  | Yes      | `false`       | Replace `\(` and `\)` with `$`.                                                                                                                                                                                                                             |
| `options.skipWrappingEquations` ( `-swe` or `--skip-wrapping-equations`)  | `boolean`  | Yes      | `false`       | Is an equation is defined in a `p` tag without any other content besides that equation, it will automatically be wrapped in `\[` and `\]`.                                                                                                                  |
| `options.includeDocumentWrapper` (`-dw` or `--include-document-wrapper`)  | `boolean`  | Yes      | `false`       | Adds a document wrapper around the converted text: `\documentclass{article} \begin{document} %converted text% \end{document}`.                                                                                                                              |
| `options.documentClass` (`-dc` or `--document-class`)                     | `string`   | Yes      | `article`     | If a document wrapper is added, the document class will be set: `\documentclass{article}`.                                                                                                                                                                  |
| `options.includePackages` (`-ip` or `--include-packages`)                 | `string[]` | Yes      | `[]`          | If a document wrapper is added, a list of used packages will be added via: `\usepackage{packagename}`. If nothing is specified, the list of includes packages will be inferred from the html e.g \cfrac => amsmath, \img => graphicx, \therefore => amssymb |
| `options.title` (`-t` or `--title`)                                       | `string`   | Yes      |               | If a document wrapper is added, the title will be set: `\title{Altered Carbon}`.                                                                                                                                                                            |
| `options.author` (`-a` or `--author`)                                     | `string`   | Yes      |               | If a document wrapper is added, the author will be set: `\author{Takashi Kovacs}`.                                                                                                                                                                          |
| `options.includeDate` (`-d` or `--incude-date`)                           | `boolean`  | Yes      | `false`       | If a document wrapper is added, the current date will be: `\date{\today}`.                                                                                                                                                                                  |
| `options.compilationDir` (`-cdr` or `--compilation-dir`)                  | `string`   | Yes      | `process.cwd` | If any images need to be downloaded for the latex compilation, they will be places in a 'images' subdirectory inside this directory.                                                                                                                        |
| `options.autoGenImageNames` (`-ain` or `--autogen-image-names`)           | `boolean`  | Yes      | `false`       | To avoid any weird file names, image files that are downloaded are automatically given a random Id with the extension of the original file.                                                                                                                 |
| `options.imageWidth` (`-iw` or `--image-width`)                           | `number`   | Yes      |               | Allows you to set a image width. This would be in the form normally accepted by latex such as: `2cm`.                                                                                                                                                       |
| `options.imageHeight` (`-ih` or `--image-height`)                         | `number`   | Yes      |               | Allows you to set a image height. This would be in the form normally accepted by latex such as: `2cm`.                                                                                                                                                      |
| `options.keepImageAspectRatio` (`-kar` or `--keep-aspect-ratio`)          | `boolean`  | Yes      | `false`       | Allows you to maintain the aspect ratio of the image. This also requires either the image width property or image height property to be set.                                                                                                                |
| `options.debug` (`--debug`)                                               | `boolean`  | Yes      | `false`       | Prints error messages when they occur such as when an image cannot be found at the given url.                                                                                                                                                               |

### `async convertFile(filePath:string, options?:Record<string,unknown>): Promise<void>`

Converts the input file to a valid latex file.

| Name                                                                      | Type       | Optional | Default            | Description                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ---------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filePath`                                                                | `string`   | No       | N/A                | Path of html file.                                                                                                                                                                                                                                          |
| `options.ignoreBreaks` (`-ib` or `--ignore-breaks`)                       | `boolean`  | Yes      | `true`             | Instead of replacing `<br/>` with //, ending the line, a simple space character is inserted instead.                                                                                                                                                        |
| `options.preferDollarInlineMath` (`-dm` or `--prefer-dollar-inline-math`) | `boolean`  | Yes      | `false`            | Replace `\(` and `\)` with `$`.                                                                                                                                                                                                                             |
| `options.skipWrappingEquations` ( `-swe` or `--skip-wrapping-equations`)  | `boolean`  | Yes      | `false`            | Is an equation is defined in a `p` tag without any other content besides that equation, it will automatically be wrapped in `\[` and `\]`.                                                                                                                  |
| `options.includeDocumentWrapper` (`-dw` or `--include-document-wrapper`)  | `boolean`  | Yes      | **`true`**         | Adds a document wrapper around the converted text: `\documentclass{article} \begin{document} %converted text% \end{document}`.                                                                                                                              |
| `options.documentClass` (`-dc` or `--document-class`)                     | `string`   | Yes      | `article`          | If a document wrapper is added, the document class will be set: `\documentclass{article}`.                                                                                                                                                                  |
| `options.includePackages` (`-ip` or `--include-packages`)                 | `string[]` | Yes      | `[]`               | If a document wrapper is added, a list of used packages will be added via: `\usepackage{packagename}`. If nothing is specified, the list of includes packages will be inferred from the html e.g \cfrac => amsmath, \img => graphicx, \therefore => amssymb |
| `options.title` (`-t` or `--title`)                                       | `string`   | Yes      |                    | If a document wrapper is added, the title will be set: `\title{Altered Carbon}`.                                                                                                                                                                            |
| `options.author` (`-a` or `--author`)                                     | `string`   | Yes      |                    | If a document wrapper is added, the author will be set: `\author{Takashi Kovacs}`.                                                                                                                                                                          |
| `options.includeDate` (`-d` or `--incude-date`)                           | `boolean`  | Yes      | `false`            | If a document wrapper is added, the current date will be: `\date{\today}`.                                                                                                                                                                                  |
| `options.compilationDir` (`-cdr` or `--compilation-dir`)                  | `string`   | Yes      | `process.cwd`      | If any images need to be downloaded for the latex compilation, they will be places in a 'images' subdirectory inside this directory.                                                                                                                        |
| `options.autoGenImageNames` (`-ain` or `--autogen-image-names`)           | `boolean`  | Yes      | `true`             | To avoid any weird file names, image files that are downloaded are automatically given a random Id with the extension of the original file.                                                                                                                 |
| `options.imageWidth` (`-iw` or `--image-width`)                           | `number`   | Yes      |                    | Allows you to set a image width. This would be in the form normally accepted by latex such as: `2cm`.                                                                                                                                                       |
| `options.imageHeight` (`-ih` or `--image-height`)                         | `number`   | Yes      |                    | Allows you to set a image height. This would be in the form normally accepted by latex such as: `2cm`.                                                                                                                                                      |
| `options.keepImageAspectRatio` (`-kar` or `--keep-aspect-ratio`)          | `boolean`  | Yes      | `false`            | Allows you to maintain the aspect ratio of the image. This also requires either the image width property or image height property to be set.                                                                                                                |
| `options.debug` (`--debug`)                                               | `boolean`  | Yes      | `false`            | Prints error messages when they occur such as when an image cannot be found at the given url.                                                                                                                                                               |
| `options.outputFilepath` (`-ofp` or `--output-file-path`)                 | `string`   | Yes      | `options.filePath` | The output filepath of the converted file. By default it will overwrite the input file.                                                                                                                                                                     |

## FAQ

### Improving output

1. Ignoring br tags
   Instead designate new sections/paragraphs using the proper html tag such as a `<p>`

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
