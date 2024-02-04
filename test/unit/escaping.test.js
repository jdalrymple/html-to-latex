import { convertFile, convertText, exportFile } from '../../src/convert.mjs';

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
