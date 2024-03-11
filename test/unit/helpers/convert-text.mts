import { expect, test as it, vi } from 'vitest';
import * as parse5 from 'parse5';
import * as Templates from '../../../src/templates.mts';
import { convertText } from '../../../src/helpers/convert-text.mts';
import * as convertElementUtils from '../../../src/helpers/convert-element.mts';
import * as convertImportUtils from '../../../src/helpers/convert-imports.mts';

// TODO: Move into a __mocks__ directory
type MockedParse5 = { parseFragement(this: void): void };

vi.mock('parse5', async (getModule) => {
  const original: MockedParse5 = await getModule();

  return {
    ...original,
    parseFragement: vi.fn().mockImplementation(original.parseFragement),
  };
});

it('should parse the input html and convert to latex', async () => {
  const parse5Spy = vi.spyOn(parse5, 'parseFragment');
  const convertElementSpy = vi.spyOn(convertElementUtils, 'convertElement');
  const html = `<body>Test</body>`;
  const root = parse5.parseFragment(html);
  const tex = await convertText(html, { includeDocumentWrapper: true });

  expect(parse5Spy).toHaveBeenCalledWith(html);
  expect(convertElementSpy).toHaveBeenCalledWith(root.childNodes[0], {});
  expect(tex).toBe('\\documentclass{article}\n\n\\begin{document}\n\n\nTest\n\n\n\\end{document}');
});

it('should include a document wrapper if configured', async () => {
  const beginDocumentTemplateSpy = vi.spyOn(Templates, 'beginDocument');
  const endDocumentTemplateSpy = vi.spyOn(Templates, 'endDocument');
  const html = `<body></body>`;

  await convertText(html, { includeDocumentWrapper: true });

  expect(beginDocumentTemplateSpy).toHaveBeenCalled();
  expect(endDocumentTemplateSpy).toHaveBeenCalled();
});

it('should not include a document wrapper by default', async () => {
  const beginDocumentTemplateSpy = vi.spyOn(Templates, 'beginDocument');
  const endDocumentTemplateSpy = vi.spyOn(Templates, 'endDocument');
  const html = `<body></body>`;

  await convertText(html);

  expect(beginDocumentTemplateSpy).not.toHaveBeenCalled();
  expect(endDocumentTemplateSpy).not.toHaveBeenCalled();
});

it('should support custom package imports', async () => {
  const templateSpy = vi.spyOn(Templates, 'usePackages');
  const html = `<body></body>`;

  await convertText(html, {
    includePackages: ['amsmath'],
    includeDocumentWrapper: true,
  });

  expect(templateSpy).toBeCalledWith(['amsmath']);
});

it('should add known packages by default if matching tags are present within the input html and no custom packages are specified', async () => {
  const templateSpy = vi.spyOn(Templates, 'usePackages');
  const convertPackageImportSpy = vi.spyOn(convertImportUtils, 'convertPackageImports');
  const html = `<body>\\cfrac</body>`;

  await convertText(html, { includeDocumentWrapper: true });

  expect(convertPackageImportSpy).toBeCalledWith(html);
  expect(templateSpy).toBeCalledWith(['amsmath']);
});

it('should support adding an author to the documentWrapper if passed', async () => {
  const templateSpy = vi.spyOn(Templates, 'beginDocument');
  const html = `<body></body>`;

  await convertText(html, { includeDocumentWrapper: true, author: 'Takashi Kovacs' });

  expect(templateSpy).toBeCalledWith({
    title: undefined,
    includeDate: false,
    author: 'Takashi Kovacs',
  });
});

it('should support adding a title to the documentWrapper if passed', async () => {
  const templateSpy = vi.spyOn(Templates, 'beginDocument');
  const html = `<body></body>`;

  await convertText(html, { includeDocumentWrapper: true, title: 'Altered Carbon' });

  expect(templateSpy).toBeCalledWith({
    title: 'Altered Carbon',
    includeDate: false,
    author: undefined,
  });
});

it('should support adding a the current date to the documentWrapper if the includeDate flag is passed', async () => {
  const templateSpy = vi.spyOn(Templates, 'beginDocument');
  const html = `<body></body>`;

  await convertText(html, { includeDocumentWrapper: true, includeDate: true });

  expect(templateSpy).toBeCalledWith({ title: undefined, includeDate: true, author: undefined });
});

it('should support custom documentClasses', async () => {
  const templateSpy = vi.spyOn(Templates, 'docClass');
  const html = `<body></body>`;

  await convertText(html, {
    includeDocumentWrapper: true,
    documentClass: 'fancydoc',
  });

  expect(templateSpy).toBeCalledWith('fancydoc');
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
