import { directory } from 'tempy';
import { pathExists, remove, readFile } from 'fs-extra';
import { resolve } from 'path';
import { generate } from 'shortid';
import { convertText, exportFile } from '../../src/convert';

jest.mock('shortid');

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

describe('convertText', () => {
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

  describe('Converting general text', () => {
    it('should convert simple text tag with bold `b` styling', async () => {
      const html = `<p>Styled <b>Text</b></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textbf{Text}\n');
    });

    it('should convert simple text tag with bold `strong` styling', async () => {
      const html = `<p>Styled <b>Text</b></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textbf{Text}\n');
    });

    it('should convert simple text tag with italics styling', async () => {
      const html = `<p>Styled <i>Text</i></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textit{Text}\n');
    });

    it('should convert simple text tag with underline styling', async () => {
      const html = `<p>Styled <u>Text</u></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\underline{Text}\n');
    });

    it('should convert text tag with span nesting', async () => {
      const html = `<p>Styled <span>Text</span></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled Text\n');
    });

    it('should convert simple text with `br` tags. These will be ignored by default', async () => {
      const html = `<p>Styled<br/>Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled Text\n');
    });

    it('should convert simple text with `br` tags and the ignoreBreaks argument set to false', async () => {
      const html = `<p>Styled<br/>Text</p>`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Styled\\\\\nText\n');
    });
  });

  describe('Converting H tags', () => {
    it('should convert simple h tag without special chars', async () => {
      const html = `<h1>Heading</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\section*{\\centering{Heading}}\n');
    });

    it('should convert simple h2 tag without special chars', async () => {
      const html = `<h2>Heading</h2>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\subsection*{Heading}\n');
    });

    it('should convert simple h3 tag without special chars', async () => {
      const html = `<h3>Heading</h3>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\subsubsection*{Heading}\n');
    });

    it('should convert simple h tag with special chars', async () => {
      const html = `<h1>Heading&#39s</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{Heading's}}\n");
    });

    it('should convert h tag with embedded css', async () => {
      const html = `<h1 style="margin:0px">Heading's</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{Heading's}}\n");
    });

    it('should convert h tag with embedded css and special characters', async () => {
      const html = await readFile(resolve(__dirname, '../test-cases/1/index.html'), 'utf-8');
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}\n");
    });
  });

  describe('Converting divider tags', () => {
    it('should convert simple divider tag', async () => {
      const html = `<p>Text</p><hr/><p>More Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Text\n\n\\hrule\n\nMore Text\n');
    });
  });

  describe('Converting img tags', () => {
    it('should convert simple img tag', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false });

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}\n');
    });

    it('should convert wrapped img tag', async () => {
      generate.mockReturnValueOnce('image2');

      const html = `<p><img src="image.png"/></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.png}\n\\end{center}\n');
    });

    it('should default to a jpg extension when converting img tag with a image url without a extension', async () => {
      generate.mockReturnValueOnce('image2');

      const html = `<p><img src="image"/></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.jpg}\n\\end{center}\n');
    });

    it('should add width restrictions when given', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, maxImageWidth: '2cm' });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[width=2cm]{images/image.png}\n\\end{center}\n',
      );
    });

    it('should add height restrictions when given', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, maxImageHeight: '2cm' });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[height=2cm]{images/image.png}\n\\end{center}\n',
      );
    });

    it('should keep aspect ratio when given and width or height are restricted', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, {
        autoGenImageNames: false,
        maxImageHeight: '2cm',
        keepImageAspectRatio: true,
      });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[height=2cm,keepaspectratio]{images/image.png}\n\\end{center}\n',
      );
    });

    it('should ignore aspect ratio when given if width or height are not restricted', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, keepImageAspectRatio: true });

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}\n');
    });
  });

  describe('Converting list tags', () => {
    it('should convert simple ul list tag', async () => {
      const html = `<ul><li>Angle reaction</li></ul>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{itemize}\n\t\\item Angle reaction\n\\end{itemize}\n');
    });

    it('should convert simple ol list tag', async () => {
      const html = `<ol><li>Angle reaction</li></ol>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{enumerate}\n\t\\item Angle reaction\n\\end{enumerate}\n');
    });
  });

  describe('Converting mixed tags', () => {
    it('should convert text with a mixture of tags', async () => {
      const html = await readFile(resolve(__dirname, '../test-cases/2/index.html'), 'utf-8');
      const tex = await convertText(html);
      const text = [
        "\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}",
        '',
        '\\subsection*{\\textbf{Concept of Forces}}',
        '',
        'Some types of forces may be (i) Contact forces, (ii) Non-contact forces \\textbf{Contact forces} involve physical contact between two objects.',
        '',
      ];

      expect(tex).toBe(text.join('\n'));
    });

    it('should convert text with a mixture of nested tags', async () => {
      const html = await readFile(resolve(__dirname, '../test-cases/2/index.html'), 'utf-8');
      const tex = await convertText(html);
      const text = [
        "\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}",
        '',
        '\\subsection*{\\textbf{Concept of Forces}}',
        '',
        'Some types of forces may be (i) Contact forces, (ii) Non-contact forces \\textbf{Contact forces} involve physical contact between two objects.',
        '',
      ];

      expect(tex).toBe(text.join('\n'));
    });
  });
});
