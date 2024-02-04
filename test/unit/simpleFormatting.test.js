import { convertFile, convertText, exportFile } from '../../src/convert.mjs';

describe('Converting Simple Formatting Tags', () => {
  it('should convert a bold tag `b` styling', async () => {
    const html = `<p>Styled <b>Text</b></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled \\textbf{Text}');
  });

  it('should convert a bold tag `strong` styling', async () => {
    const html = `<p>Styled <strong>Text</strong></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled \\textbf{Text}');
  });

  it('should convert simple text tag with italics styling', async () => {
    const html = `<p>Styled <i>Text</i></p>`;
    const tex = await convertText(html);

    const html2 = `<p>Styled <em>Text</em></p>`;
    const tex2 = await convertText(html2);

    expect(tex).toBe('Styled \\textit{Text}');
    expect(tex2).toBe('Styled \\textit{Text}');
  });

  it('should convert simple text tag with underline styling', async () => {
    const html = `<p>Styled <u>Text</u></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled \\underline{Text}');
  });

  it('should convert simple text tag with strikethrough styling', async () => {
    const html = `<p>Styled <s>Text</s></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled \\sout{Text}');
  });

  it('should allow nesting', async () => {
    const html = `<p>Styled <b><i>Text</i></b></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('Styled \\textbf{\\textit{Text}}');
  });

  it('should convert superscripts and subscripts', async () => {
    const html = `<p>water squared can be writtena as: H<sub>2</sub>O<sup>2</sup></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('water squared can be writtena as: H$_{2}$O$^{2}$');
  });
});

describe('Converting Equations', () => {
  it('should convert superscripts and subscripts', async () => {
    const html = `<p>water squared can be writtena as: H<sub>2</sub>O<sup>2</sup></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('water squared can be writtena as: H$_{2}$O$^{2}$');
  });

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
