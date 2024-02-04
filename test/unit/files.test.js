import { directory } from 'tempy';
import { pathExists, readFile, remove } from 'fs-extra';
import { resolve } from 'path';
import ShortId from 'shortid';
import { convertFile, convertText, exportFile } from '../../src/convert.mjs';

describe('exportFile', () => {
  let dir;

  beforeEach(() => {
    dir = directory();
  });

  afterEach(async () => {
    await remove(dir);
  });

  it('should export latex file', async () => {
    await exportFile('testing', 'test', dir);

    const exists = await pathExists(resolve(dir, 'test.tex'));

    expect(exists).toBeTruthy();
  });
});

describe('convertFile', () => {
  describe('Converting mixed tags', () => {
    it('should convert text with a mixture of nested tags', async () => {
      await convertFile(resolve(__dirname, '../test-cases/2/index.html'), {
        includeDocumentWrapper: false,
      });

      const tex = await readFile(resolve(__dirname, '../test-cases/2/index.html.tex'), 'utf-8');
      const text = [
        "\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}",
        '',
        '\\subsection*{\\textbf{Concept of Forces}}',
        '',
        'Some types of forces may be (i) Contact forces, (ii) Non-contact forces \\textbf{Contact forces} involve physical contact between two objects.',
      ];

      expect(tex).toBe(text.join('\n'));

      await remove(resolve(__dirname, '../test-cases/2/index.html.tex'));
    });
  });

  it('should convert text without tag wrapper while ignoring break tags', async () => {
    const spy = jest.spyOn(ShortId, 'generate');
    spy.mockImplementation(() => 'image2');

    await convertFile(resolve(__dirname, '../test-cases/3/index.html'), { ignoreBreaks: false });

    const tex = await readFile(resolve(__dirname, '../test-cases/3/index.html.tex'), 'utf-8');
    const ref = await readFile(resolve(__dirname, '../test-cases/3/output.tex'), 'utf-8');

    expect(tex).toBe(ref);

    await remove(resolve(__dirname, '../test-cases/3/index.html.tex'));

    spy.mockClear();
  });
});
