// import { convertText } from '../../../src/convert.mjs';

//   // this was removed because it would be fail since we are allowing inline math in HTML.
//   // it('should escape `$`, `#`, `_`, `{`, `}`, `~`, `^`', async () => {
//   //     const html = `<p>Styled$Text #Text _Text {Text} ~Text ^Text</p>`;
//   //     const tex = await convertText(html);

//   //     expect(tex).toBe('Styled\\$Text \\#Text \\_Text \\{Text\\} \\~Text \\^Text');
//   // });

//   // Again, this was removed because we are allowing inline math in HTML.
//   // it('should escape `\\`', async () => {
//   //     const html = `<p>Styled\\Text</p>`;
//   //     const tex = await convertText(html);

//   //     expect(tex).toBe('Styled\\textbackslash{}Text');
//   // });

//   it('should convert simple tags with special chars', async () => {
//     const html = `<h1>Heading&#39s</h1><section>Section&#39s</section><p>Paragraph&#39s</p>`;
//     const tex = await convertText(html);

//     expect(tex).toBe("\\section*{\\centering{Heading's}}\n\nSection's\n\nParagraph's");
//   });

//   it('should convert simple tags with embedded css', async () => {
//     const html = `<h1 style="margin:0px">Heading's</h1>`;
//     const tex = await convertText(html);

//     expect(tex).toBe("\\section*{\\centering{Heading's}}");
//   });

//   it('should convert simple tags with ignoring any attributes', async () => {
//     const html = `<h1 style="margin:0px" class="test" id="pgTitle">Heading's</h1>`;
//     const tex = await convertText(html);

//     expect(tex).toBe("\\section*{\\centering{Heading's}}");
//   });
// });

// describe('Converting Simple Tags', () => {
//   it('should convert a link', async () => {
//     const html = `<p>visit <a href="https://www.google.com">Google</a></p>`;
//     const tex = await convertText(html);

//     expect(tex).toBe('visit \\href{https://www.google.com}{Google}');
//   });

//   it('should convert text tag with span nesting', async () => {
//     const html = `<p>Styled <span>Text</span></p>`;
//     const tex = await convertText(html);

//     expect(tex).toBe('Styled Text');
//   });

//   it('should convert simple text with `br` tags and the ignoreBreaks argument set to false', async () => {
//     const html = `Styled<br/>Text`;
//     const tex = await convertText(html, { ignoreBreaks: false });

//     expect(tex).toBe('Styled\n\nText');
//   });

//   it('should convert complex text with `br` tags and the ignoreBreaks argument set to false', async () => {
//     const html = `Three concentric metal shells<br/>More text here.<p> Inner p tag </p>`;
//     const tex = await convertText(html, { ignoreBreaks: false });

//     expect(tex).toBe('Three concentric metal shells\n\nMore text here.\n\nInner p tag');
//   });

// });
