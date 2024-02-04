#!/usr/bin/env node
/* eslint no-console: 0 */

import program from 'sywac';
import { convertFile } from './convert.mts';

// Add default settings
program
  .version('-v, --version')
  .help('-h, --help')
  .epilogue('Copyright 2024')
  .command('convert-file', {
    desc: 'Convert HTML to Latex',
    setup: (args) => {
      args
        .positional('[--ifp] <input-file>', {
          type: 'string',
        })
        .string('-ofp --output-file-path', {
          group: 'Output Options',
        })
        .boolean('-ib --ignore-breaks', {
          group: 'Parsing Options',
          defaultValue: true,
        })
        .boolean('-dm --prefer-dollar-inline-math', {
          group: 'Parsing Options',
          defaultValue: false,
        })
        .boolean('-swe --skip-wrapping-equations', {
          group: 'Parsing Options',
          defaultValue: false,
        })
        .boolean('-dw --include-document-wrapper', {
          group: 'Parsing Options',
          defaultValue: false,
        })
        .string('-dc --document-class', {
          group: 'Parsing Options',
          defaultValue: 'article',
        })
        .array('-ip --include-packages', {
          group: 'Parsing Options',
        })
        .string('-t --title', {
          group: 'Parsing Options',
        })
        .string('-a --author', {
          group: 'Parsing Options',
        })
        .boolean('-d --include-date', {
          group: 'Parsing Options',
        })
        .string('-cdr --compilation-dir', {
          group: 'Image Parsing Options',
          default: process.cwd(),
        })
        .boolean('-ain --autogen-image-names', {
          group: 'Image Parsing Options',
          defaultValue: true,
        })
        .string('-iw --image-width', {
          group: 'Image Parsing Options',
        })
        .string('-ih --image-height', {
          group: 'Image Parsing Options',
        })
        .boolean('-kar --keep-image-aspect-ratio', {
          group: 'Image Parsing Options',
          default: false,
        })
        .boolean('--debug', {
          group: 'Image Parsing Options',
          defaultValue: false,
        });
    },
    run: async (args) => {
      await convertFile(args.ifp, {
        outputFilePath: args.ofp,
        autoGenImageNames: args.ain,
        includeDocumentWrapper: args.dw,
        documentClass: args.dc,
        includePackages: args.ip,
        compilationDir: args.cpr,
        preferDollarInlineMath: args.dm,
        skipWrappingEquations: args.swe,
        debug: args.debug,
        imageWidth: args.iw,
        imageHeight: args.ih,
        keepImageAspectRatio: args.kar,
        title: args.t,
        includeDate: args.d,
        author: args.a,
        ignoreBreaks: args.ib,
      });
    },
  });

// Parse input
program.parse().then(({ output }) => {
  console.log(output);
});
