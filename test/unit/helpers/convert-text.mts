import { expect, describe, test as it, vi } from 'vitest';
import * as parse5 from 'parse5';
import { convertText } from '../../../src/helpers/convert-text.mts';
import * as convertElementUtils from '../../../src/helpers/convert-element.mts';

describe('convertText', () => {
  it('should parse the input html and convert to latex', async () => {
    const parse5Spy = vi.spyOn(parse5, 'parseFragment');
    const convertElementSpy = vi.spyOn(convertElementUtils, 'convertElement');
    const html = `<body></body>`;
    const root = parse5.parseFragment(html);
    const tex = await convertText(html);

    expect(parse5Spy).toHaveBeenCalledWith(html);
    expect(convertElementSpy).toHaveBeenCalledWith(root.childNodes[0], {});
    expect(tex).toBe('');
  });

  it('should include a document wrapper if configured', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true });

    expect(tex).toBe('\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}');
  });

  it('should not include a document wrapper by default', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html);

    expect(tex).toBe('');
  });

  it('should support custom package imports', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, {
      includePackages: ['amsmath'],
      includeDocumentWrapper: true,
    });

    expect(tex).toBe(
      '\\usepackage{amsmath}\n\n\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should add known packages by default if matching tags are present within the input html and no custom packages are specified', async () => {
    const html = `<body>\\cfrac</body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true });

    expect(tex).toBe(
      '\\usepackage{amsmath}\n\n\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should support adding an author to the documentWrapper if passed', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true, author: 'Takashi Kovacs' });

    expect(tex).toBe(
      '\\author{Takashi Kovachs}\n\n\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should support adding a title to the documentWrapper if passed', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true, title: 'Altered Carbon' });

    expect(tex).toBe(
      '\\title{Altered Carbon}\n\n\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should support adding a the current date to the documentWrapper if the includeDate flag is passed', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true, includeDate: true });

    expect(tex).toBe(
      '\\title{Altered Carbon}\n\n\\documentclass{article}\n\n\\date{\\today}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should support custom documentClasses', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, {
      includeDocumentWrapper: true,
      documentClass: 'fancydoc',
    });

    expect(tex).toBe('\\documentclass{fancydoc}\n\n\\begin{document}\n\n\n\\end{document}');
  });
});
