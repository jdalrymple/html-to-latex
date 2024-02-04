import { convertFile, convertText, exportFile } from '../../src/convert.mjs';

describe('Document wrapper', () => {
  it('should insert the basic document wrapper and default document class of article', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true });

    expect(tex).toBe('\\documentclass{article}\n\n\\begin{document}\n\n\n\\end{document}');
  });

  it('should insert the basic document heading with author', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true, author: 'Takashi' });

    expect(tex).toBe(
      '\\documentclass{article}\n\n\\author{Takashi}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });

  it('should insert the basic document heading with title', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, {
      includeDocumentWrapper: true,
      title: 'Altered Carbon',
    });

    expect(tex).toBe(
      '\\documentclass{article}\n\n\\title{Altered Carbon}\n\n\\begin{document}\n\n\\maketitle\n\n\n\\end{document}',
    );
  });

  it('should insert the basic document heading with date', async () => {
    const html = `<body></body>`;
    const tex = await convertText(html, { includeDocumentWrapper: true, includeDate: true });

    expect(tex).toBe(
      '\\documentclass{article}\n\n\\date{\\today}\n\n\\begin{document}\n\n\n\\end{document}',
    );
  });
});
