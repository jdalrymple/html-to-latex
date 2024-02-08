import { expect, describe, beforeEach, afterEach, test as it } from 'vitest';
import { temporaryDirectory } from 'tempy';
import { rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { analyzeForPackageImports, exportFile } from '../../src/utils.mjs';

describe('exportFile', () => {
  let dir: string;

  beforeEach(() => {
    dir = temporaryDirectory();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('should export latex file', async () => {
    await exportFile('testing', 'test', dir);

    const exists = await stat(resolve(dir, 'test.tex'));

    expect(exists).toBeTruthy();
  });
});
