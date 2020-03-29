#!/usr/bin/env node
/* eslint no-console: 0 */

import program from 'sywac';
import { extname, basename } from 'path';
import { convertFile } from './convert';

// Add default settings
program
  .version('-v, --version')
  .help('-h, --help')
  .epilogue('Copyright 2020')
  .command('convert-file', {
    desc: 'Convert HTML to Latex',
    setup: args => {
      args
        .positional('[--ifp] <input-file>', {
          type: 'string',
        })
        .boolean('-ow --overwrite', {
          group: 'Output Options',
          defaultValue: false,
        })
        .string('-ofp --output-file-path', {
          group: 'Output Options',
        })
        .boolean('-ib --ignore-breaks', {
          group: 'Parsing Options',
          defaultValue: true,
        });
    },
    run: async args => {
      const filename = basename(args.ifp, extname(args.ifp));
      const outputFileName = args.ow === true ? filename : `processed-${filename}`;

      await convertFile(filename, { outputFileName, ignoreBreaks: args.ib });
    },
  });

// Parse input
program.parse().then(({ output }) => {
  console.log(output);
});
