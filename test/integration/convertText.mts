import { convertText } from '../../../src/convert.mjs';

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

describe('Escapes illegal characters', () => {
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

  it('should escape `&`', async () => {
    const html = `<p>Styled&Text</p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled\\&Text');
  });

  it('should escape `#`, `~`', async () => {
    const html = `<p>Styled#Text ~Text</p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled\\#Text \\textasciitilde{}Text');
  });

  // this was removed because it would be fail since we are allowing inline math in HTML.
  // it('should escape `$`, `#`, `_`, `{`, `}`, `~`, `^`', async () => {
  //     const html = `<p>Styled$Text #Text _Text {Text} ~Text ^Text</p>`;
  //     const tex = await convertText(html);

  //     expect(tex).toBe('Styled\\$Text \\#Text \\_Text \\{Text\\} \\~Text \\^Text');
  // });

  it('should escape `|`', async () => {
    const html = `<p>Styled|Text</p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled\\textbar{}Text');
  });

  // Again, this was removed because we are allowing inline math in HTML.
  // it('should escape `\\`', async () => {
  //     const html = `<p>Styled\\Text</p>`;
  //     const tex = await convertText(html);

  //     expect(tex).toBe('Styled\\textbackslash{}Text');
  // });

  it('should not escape a char e.g. `%` if its already escaped', async () => {
    const html = `<p>Styled\\%Text</p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled\\%Text');
  });

  it('should convert simple tags with special chars', async () => {
    const html = `<h1>Heading&#39s</h1><section>Section&#39s</section><p>Paragraph&#39s</p>`;
    const tex = await convertText(html);

    expect(tex).toBe("\\section*{\\centering{Heading's}}\n\nSection's\n\nParagraph's");
  });

  it('should convert simple tags with embedded css', async () => {
    const html = `<h1 style="margin:0px">Heading's</h1>`;
    const tex = await convertText(html);

    expect(tex).toBe("\\section*{\\centering{Heading's}}");
  });

  it('should convert simple tags with ignoring any attributes', async () => {
    const html = `<h1 style="margin:0px" class="test" id="pgTitle">Heading's</h1>`;
    const tex = await convertText(html);

    expect(tex).toBe("\\section*{\\centering{Heading's}}");
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

describe('Converting with debug flag', () => {
  it('should display errors when converting img tag with an inaccessible source url with the debug flag', async () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation();
    const html = `<img src="image.png"/>`;

    await convertText(html, { autoGenImageNames: false, debug: true });

    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  it('should not display errors when converting img tag with an inaccessible source url without the debug flag', async () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation();
    const html = `<img src="image.png"/>`;

    await convertText(html, { autoGenImageNames: false });

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });
});

describe('Converting Simple Tags', () => {
  it('should properly convert html tags', async () => {
    const html = `<html><body>Test</body></html>`;
    const tex = await convertText(html);

    expect(tex).toBe('Test');
  });

  it('should convert heading tags', async () => {
    // h4, h5, and h6 are converted to subsubsections.
    const html = `<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6>`;
    const tex = await convertText(html);

    expect(tex).toBe(
      '\\section*{\\centering{Heading 1}}\n\n\\subsection*{Heading 2}\n\n\\subsubsection*{Heading 3}\n\n\\subsubsection*{Heading 4}\n\n\\subsubsection*{Heading 5}\n\n\\subsubsection*{Heading 6}',
    );
  });

  it('should convert unordered lists', async () => {
    const html = `<ul><li>Item 1</li><li>Item 2</li></ul>`;
    const tex = await convertText(html);

    expect(tex).toBe('\\begin{itemize}\n\t\\item Item 1\n\t\\item Item 2\n\\end{itemize}');
  });

  it('should convert ordered lists', async () => {
    const html = `<ol><li>Item 1</li><li>Item 2</li></ol>`;
    const tex = await convertText(html);

    expect(tex).toBe('\\begin{enumerate}\n\t\\item Item 1\n\t\\item Item 2\n\\end{enumerate}');
  });

  it('should convert a table', async () => {
    const html = `<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Item 1</td><td>Item 2</td></tr></table>`;
    const tex = await convertText(html);

    expect(tex).toBe(
      '\\begin{tabular}{|c|c|}\n\t\\hline\n\tHeader 1 & Header 2 \\\\\n\t\\hline\n\tItem 1 & Item 2 \\\\\n\t\\hline\n\t\\end{tabular}',
    );
  });

  it('should convert code tags', async () => {
    const html = `<code>console.log('Hello World!');</code>`;
    const tex = await convertText(html);

    expect(tex).toBe("\\begin{lstlisting}\nconsole.log('Hello World!');\n\\end{lstlisting}");
  });

  it('should convert horizontal rule', async () => {
    const html = `<hr>`;
    const tex = await convertText(html);

    expect(tex).toBe('\\hrule\n');
  });

  it('should convert a link', async () => {
    const html = `<p>visit <a href="https://www.google.com">Google</a></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('visit \\href{https://www.google.com}{Google}');
  });

  it('should convert a div', async () => {
    const html = `<div></div>`;
    const tex = await convertText(html);

    expect(tex).toBe('');
  });

  it('should convert a nested div', async () => {
    const html = `<div><div>Hello World!</div></div>`;
    const tex = await convertText(html);

    expect(tex).toBe('Hello World!');
  });

  it('should convert text tag with span nesting', async () => {
    const html = `<p>Styled <span>Text</span></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled Text');
  });

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

  it('should convert an unknown tag inside text', async () => {
    const html = `<p>I was born on <time datetime="1000-12-31 12:00">31 Dec</time></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('I was born on 31 Dec');
  });

  it('should convert an unknown tag', async () => {
    const html = `<unknown>Text</unknown>`;
    const tex = await convertText(html);

    expect(tex).toBe('Text');
  });

  // additional tests (In original, logic is captured above):
  // note: section, aside, main, footer, etc, needn't to be handled separately; they can be handled by the default case (unknown/ordinary tag).
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

  it('should properly convert aside tags', async () => {
    const html = `<body><footer>Test</footer></body>`;
    const tex = await convertText(html);

    expect(tex).toBe('Test');
  });

  it('should properly convert main tags', async () => {
    const html = `<body><main>Test</main></body>`;
    const tex = await convertText(html);

    expect(tex).toBe('Test');
  });
});

describe('Converting breaks', () => {
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
