#!/usr/bin/env node
import { program } from '@commander-js/extra-typings';
import { readFileSync } from 'node:fs';
import { convertFile } from './convert.mts';

const pkgJSON = JSON.parse(readFileSync('../package.json').toString()) as Record<string, string>;

// Add default settings
program
  .name('html-to-latex')
  .version(pkgJSON.version)
  .command('convert-file')
  .description('Converts a html file to a latex file')
  .argument('<input-file-path>', 'The path to your html file')
  .option('-ofp --output-file-path <output-file-path>', 'The output path to your latex file')
  .option(
    '-ib --ignore-breaks',
    'Instead of replacing `<br/>` with //, ending the line, a simple space character is inserted instead.',
    true,
  )
  .option('-dm --prefer-dollar-inline-math', 'Replace `(` and `)` with `$`.', false)
  .option(
    '-swe --skip-wrapping-equations',
    'Is an equation is defined in a `p` tag without any other content besides that equation, it will automatically be wrapped in `[` and `]`.',
    false,
  )
  .option(
    '-dw --include-document-wrapper',
    'Adds a document wrapper around the converted text: `documentclass{article} \begin{document} %converted text% end{document}`.',
    false,
  )
  .option(
    '-dc --document-class <document-class>',
    'If a document wrapper is added, the document class will be set: `documentclass{article}`.',
    'article',
  )
  .option(
    '-ip --included-packages <included-packages...>',
    'If a document wrapper is added, a list of used packages will be added via: `\\usepackage{packagename}`. If nothing is specified, the list of includes packages will be inferred from the html e.g cfrac => amsmath, img => graphicx, \therefore => amssymb',
  )
  .option(
    '-t --title <title>',
    'If a document wrapper is added, the title will be set: `\title{Altered Carbon}`.',
  )
  .option(
    '-a --author <author>',
    'If a document wrapper is added, the author will be set: `author{Takashi Kovacs}`.',
  )
  .option(
    '-d --include-date',
    'If a document wrapper is added, the current date will be: `date{\today}`.',
    false,
  )
  .option(
    '-cdr --compilation-dir <compilation-dir>',
    "  If any images need to be downloaded for the latex compilation, they will be places in a 'images' subdirectory inside this directory.",
    process.cwd(),
  )
  .option(
    '-ain --autogen-image-names',
    'To avoid any weird file names, image files that are downloaded are automatically given a random Id with the extension of the original file.',
    true,
  )
  .option(
    '-iw --image-width <image-width>',
    'Allows you to set a image width. This would be in the form normally accepted by latex such as: `2cm`.',
  )
  .option(
    '-ih --image-height <image-height>',
    'Allows you to set a image height. This would be in the form normally accepted by latex such as: `2cm`.',
  )
  .option(
    '-kar --keep-image-aspect-ratio',
    'Allows you to maintain the aspect ratio of the image. This also requires either the image width property or image height property to be set.',
    false,
  )
  .option(
    '--debug',
    'Prints error messages when they occur such as when an image cannot be found at the given url.',
    false,
  )
  .action((inputFilePath, options) =>
    convertFile(inputFilePath, {
      outputFilePath: options.outputFilePath,
      ignoreBreaks: options.ignoreBreaks,
      preferDollarInlineMath: options.preferDollarInlineMath,
      skipWrappingEquations: options.skipWrappingEquations,
      includeDocumentWrapper: options.includeDocumentWrapper,
      documentClass: options.documentClass,
      includedPackages: options.includedPackages,
      title: options.title,
      author: options.author,
      includeDate: options.includeDate,
      compilationDir: options.compilationDir,
      autogenImageNames: options.autogenImageNames,
      imageWidth: options.imageWidth,
      imageHeight: options.imageHeight,
      keepImageAspectRatio: options.keepImageAspectRatio,
      debug: options.debug,
    }),
  );

program.parse();
