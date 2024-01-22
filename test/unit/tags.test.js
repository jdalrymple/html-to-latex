import { convertText, exportFile, convertFile } from '../../src/convert';

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
    
        expect(tex).toBe('\\section*{\\centering{Heading 1}}\n\n\\subsection*{Heading 2}\n\n\\subsubsection*{Heading 3}\n\n\\subsubsection*{Heading 4}\n\n\\subsubsection*{Heading 5}\n\n\\subsubsection*{Heading 6}');
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

        expect(tex).toBe('\\begin{tabular}{|c|c|}\n\t\\hline\n\tHeader 1 & Header 2 \\\\\n\t\\hline\n\tItem 1 & Item 2 \\\\\n\t\\hline\n\t\\end{tabular}');
    });

    it('should convert code tags', async () => {
        const html = `<code>console.log('Hello World!');</code>`;
        const tex = await convertText(html);
  
        expect(tex).toBe('\\begin{lstlisting}\nconsole.log(\'Hello World!\');\n\\end{lstlisting}');
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

describe("Converting breaks", () => {
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