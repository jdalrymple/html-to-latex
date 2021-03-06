import { directory } from 'tempy';
import { pathExists, remove, readFile } from 'fs-extra';
import { resolve } from 'path';
import ShortId from 'shortid';
import { convertText, exportFile, convertFile } from '../../src/convert';

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

  describe('Converting embedded sectioning tags', () => {
    it('should properly convert section tags', async () => {
      const html = `<body><section>Test</section></body>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });

    it('should properly convert aside tags', async () => {
      const html = `<body><aside>Test</aside></body>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });

    it('should properly convert div tags', async () => {
      const html = `<body><div>Test</div></body>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });

    it('should properly convert html tags', async () => {
      const html = `<html><body>Test</body></html>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });

    it('should properly convert header tags', async () => {
      const html = `<body><header>Test</header></body>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });

    it('should properly convert footer tags', async () => {
      const html = `<body><footer>Test</footer></body>`;
      const tex = await convertText(html);

      expect(tex).toBe('Test');
    });
  });

  describe('Converting general text', () => {
    it('should convert simple text tag with bold `b` styling', async () => {
      const html = `<p>Styled <b>Text</b></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textbf{Text}');
    });

    it('should convert simple text tag with bold `strong` styling', async () => {
      const html = `<p>Styled <b>Text</b></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textbf{Text}');
    });

    it('should convert simple text tag with italics styling', async () => {
      const html = `<p>Styled <i>Text</i></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\textit{Text}');
    });

    it('should convert simple text tag with underline styling', async () => {
      const html = `<p>Styled <u>Text</u></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled \\underline{Text}');
    });

    it('should convert text tag with span nesting', async () => {
      const html = `<p>Styled <span>Text</span></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled Text');
    });

    it('should ignore `\t`', async () => {
      const html = `<p>Styled\tText</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('StyledText');
    });

    it('should escape `%`', async () => {
      const html = `<p>Styled%Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled\\%Text');
    });

    it('should not escape `%` if its already escaped', async () => {
      const html = `<p>Styled\\%Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled\\%Text');
    });
  });

  describe('Converting text with different types of breaks', () => {
    it('should convert simple `p` tag text with `br` tags. These will be ignored by default', async () => {
      const html = `<p>Styled<br/>Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Styled Text');
    });

    it('should convert simple `p` tag text with `br` tags and the ignoreBreaks argument set to false', async () => {
      const html = `<p>Styled<br/>Text</p>`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Styled\n\nText');
    });

    it('should convert simple text with `\n` and the ignoreBreaks argument set to false', async () => {
      const html = `<p>Styled\nText</p>`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Styled\n\nText');
    });

    it('should convert simple text with `\r` and the ignoreBreaks argument set to false', async () => {
      const html = `<p>Styled\rText</p>`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Styled\n\nText');
    });
  });

  describe('Unwrapped content', () => {
    it('should convert simple text with `br` tags and the ignoreBreaks argument set to false', async () => {
      const html = `Styled<br/>Text`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Styled\n\nText');
    });

    it('should convert complex text with `br` tags and the ignoreBreaks argument set to false', async () => {
      const html = `Three concentric metal shells<br/>More text here.<p> Inner p tag </p>`;
      const tex = await convertText(html, { ignoreBreaks: false });

      expect(tex).toBe('Three concentric metal shells\n\nMore text here.\n\nInner p tag');
    });
  });

  describe('Converting text with equations', () => {
    it('should convert eq wrappers p tags with only an eq to use the \\[ wrapper instead of \\(', async () => {
      const html = `<p>\\(x = 5\\Omega\\)</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\[x = 5\\Omega\\]');
    });

    it('should convert p tags with only an eq to use the \\[ wrapper instead of $', async () => {
      const html = `<p>$x = 5\\Omega$</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\[x = 5\\Omega\\]');
    });

    it('should not convert p tags with only an eq to use the \\[ wrapper instead of \\( if skipWrappingEquations is true', async () => {
      const html = `<p>\\(x = 5\\Omega\\)</p>`;
      const tex = await convertText(html, { skipWrappingEquations: true });

      expect(tex).toBe('\\(x = 5\\Omega\\)');
    });

    it('should not convert p tags with only an eq to use the \\[ wrapper instead of $ if skipWrappingEquations is true', async () => {
      const html = `<p>$x = 5\\Omega$</p>`;
      const tex = await convertText(html, { skipWrappingEquations: true });

      expect(tex).toBe('$x = 5\\Omega$');
    });

    it('should not modify eq wrappers in p tags with an eq and other content', async () => {
      const html = `<p>Some content $x = 5\\Omega$</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Some content $x = 5\\Omega$');
    });

    it('should prefer $ eq wrappers if configuration is given', async () => {
      const html = `<p>Some content \\(x = 5\\Omega\\)</p>`;
      const tex = await convertText(html, { preferDollarInlineMath: true });

      expect(tex).toBe('Some content $x = 5\\Omega$');
    });

    it('should handle eqs deep within text without tag wrapping', async () => {
      const html =
        'This is some plain text \\(A,{\\rm{ }}B\\) and \\(C\\) with random equations \\(a,{\\rm{ }}b\\) and \\(c\\) \\((a < b < c)\\)';
      const tex = await convertText(html, { preferDollarInlineMath: true });

      expect(tex).toBe(
        'This is some plain text $A,{\\rm{ }}B$ and $C$ with random equations $a,{\\rm{ }}b$ and $c$ $(a < b < c)$',
      );
    });
  });

  describe('Converting H tags', () => {
    it('should convert simple h tag without special chars', async () => {
      const html = `<h1>Heading</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\section*{\\centering{Heading}}');
    });

    it('should convert simple h2 tag without special chars', async () => {
      const html = `<h2>Heading</h2>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\subsection*{Heading}');
    });

    it('should convert simple h3 tag without special chars', async () => {
      const html = `<h3>Heading</h3>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\subsubsection*{Heading}');
    });

    it('should convert simple h tag with special chars', async () => {
      const html = `<h1>Heading&#39s</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{Heading's}}");
    });

    it('should convert h tag with embedded css', async () => {
      const html = `<h1 style="margin:0px">Heading's</h1>`;
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{Heading's}}");
    });

    it('should convert h tag with embedded css and special characters', async () => {
      const html =
        '<h1 style="margin-left:0in; margin-right:0in; text-align:center"><u><strong>Newton&#39;s Laws of Motion</strong></u></h1>';
      const tex = await convertText(html);

      expect(tex).toBe("\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}");
    });
  });

  describe('Converting divider tags', () => {
    it('should convert simple divider tag', async () => {
      const html = `<p>Text</p><hr/><p>More Text</p>`;
      const tex = await convertText(html);

      expect(tex).toBe('Text\n\n\\hrule\n\n\nMore Text');
    });
  });

  describe('Converting img tags', () => {
    it('should convert simple img tag', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false });

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}');
    });

    it('should convert wrapped img tag', async () => {
      const spy = jest.spyOn(ShortId, 'generate');
      spy.mockImplementation(() => 'image2');

      const html = `<p><img src="image.png"/></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.png}\n\\end{center}');

      spy.mockClear();
    });

    it('should default to a jpg extension when converting img tag with a image url without a extension', async () => {
      const spy = jest.spyOn(ShortId, 'generate');
      spy.mockImplementation(() => 'image2');

      const html = `<p><img src="image"/></p>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.jpg}\n\\end{center}');

      spy.mockClear();
    });

    it('should add width restrictions when given', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, imageWidth: '2cm' });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[width=2cm]{images/image.png}\n\\end{center}',
      );
    });

    it('should add height restrictions when given', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, imageHeight: '2cm' });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[height=2cm]{images/image.png}\n\\end{center}',
      );
    });

    it('should keep aspect ratio when given and width or height are restricted', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, {
        autoGenImageNames: false,
        imageHeight: '2cm',
        keepImageAspectRatio: true,
      });

      expect(tex).toBe(
        '\\begin{center}\n\t\\includegraphics[height=2cm,keepaspectratio]{images/image.png}\n\\end{center}',
      );
    });

    it('should ignore aspect ratio when given if width or height are not restricted', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, keepImageAspectRatio: true });

      expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}');
    });

    it('should not center the image', async () => {
      const html = `<img src="image.png"/>`;
      const tex = await convertText(html, { autoGenImageNames: false, centerImages: false });

      expect(tex).toBe('\\includegraphics{images/image.png}');
    });
  });

  describe('Converting list tags', () => {
    it('should convert simple ul list tag', async () => {
      const html = `<ul><li>Angle reaction</li></ul>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{itemize}\n\t\\item Angle reaction\n\\end{itemize}');
    });

    it('should convert simple ol list tag', async () => {
      const html = `<ol><li>Angle reaction</li></ol>`;
      const tex = await convertText(html);

      expect(tex).toBe('\\begin{enumerate}\n\t\\item Angle reaction\n\\end{enumerate}');
    });
  });

  describe('Converting with debug flag', () => {
    it('should display errors when converting img tag with an inaccessible source url with the debug flag', async () => {
      const spy = jest.spyOn(console, 'debug').mockImplementation();
      const html = `<img src="image.png"/>`;

      await convertText(html, { autoGenImageNames: false, debug: true });

      expect(spy).toBeCalledTimes(2);

      spy.mockRestore();
    });

    it('should not display errors when converting img tag with an inaccessible source url without the debug flag', async () => {
      const spy = jest.spyOn(console, 'debug').mockImplementation();
      const html = `<img src="image.png"/>`;

      await convertText(html, { autoGenImageNames: false });

      expect(spy).toBeCalledTimes(0);

      spy.mockRestore();
    });
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
