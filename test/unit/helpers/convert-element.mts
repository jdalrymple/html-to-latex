import { parseFragment } from 'parse5';
import { expect, test as it, vi } from 'vitest';
import { convertElement } from '../../../src/helpers/convert-element.mts';
import * as Template from '../../../src/templates.mts';
import * as convertOrderedListsUtils from '../../../src/helpers/convert-ordered-list.mts';
import * as convertUnorderedListsUtils from '../../../src/helpers/convert-unordered-list.mts';
import * as convertImageUtils from '../../../src/helpers/convert-image.mts';
import * as convertHeadingUtils from '../../../src/helpers/convert-heading.mts';
import * as convertParagraphUtils from '../../../src/helpers/convert-paragraph.mts';
import * as convertTableUtils from '../../../src/helpers/convert-table.mts';
import * as convertInlineElementUtils from '../../../src/helpers/convert-inline-element.mts';
import { ElementNode } from '../../../src/types.mts';

it('should handle broken nodes', async () => {
  const node = parseFragment('<tab src=" />').childNodes[0];

  const tex = await convertElement(node);

  expect(tex).toBe(null);
});

it('should handle empty block elements', async () => {
  const node = parseFragment('<div></div>').childNodes[0];

  const tex = await convertElement(node);

  expect(tex).toBe(null);
});

it('should properly convert html tags', async () => {
  const node = parseFragment('<html><body>Test</body></html>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should convert a div', async () => {
  const node = parseFragment('<div>Test</div>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should convert a nested div', async () => {
  const node = parseFragment('<div><div>Hello World!</div></div>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Hello World!');
});

it('should properly convert section tags', async () => {
  const node = parseFragment('<body><section>Test</section></body>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should properly convert aside tags', async () => {
  const node = parseFragment('<body><aside>Test</aside></body>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should properly convert aside tags', async () => {
  const node = parseFragment('<body><footer>Test</footer></body>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should properly convert main tags', async () => {
  const node = parseFragment('<body><main>Test</main></body>');
  const tex = await convertElement(node.childNodes[0]);

  expect(tex).toBe('Test');
});

it('should assume unknown elements are inline elements', async () => {
  const convertInlineElementSpy = vi.spyOn(convertInlineElementUtils, 'convertInlineElement');

  const node = parseFragment('<unknown>Text</unknown>').childNodes[0];

  await convertElement(node);

  expect(convertInlineElementSpy).toHaveBeenCalledWith(node, undefined);
});

it('should convert an unknown tag', async () => {
  const node = parseFragment('<unknown>Text</unknown>').childNodes[0];
  const tex = await convertElement(node);

  expect(tex).toBe('Text');
});

it('should convert an unknown tag inside text', async () => {
  const node = parseFragment('<p>I was born on <time datetime="1000-12-31 12:00">31 Dec</time></p>')
    .childNodes[0];
  const tex = await convertElement(node);

  expect(tex).toBe('I was born on 31 Dec');
});

it('should convert horizontal rule', async () => {
  const dividerSpy = vi.spyOn(Template, 'divider');
  const node = parseFragment('<hr>').childNodes[0];

  await convertElement(node);

  expect(dividerSpy).toHaveBeenCalled();
});

it('should convert code tags', async () => {
  const templateSpy = vi.spyOn(Template, 'sourceCode');
  const node = parseFragment(`<code>console.log('Hello World!');</code>`).childNodes[0];

  await convertElement(node);

  expect(templateSpy).toHaveBeenCalledWith(`console.log('Hello World!');`);
});

it('should convert heading tags', async () => {
  const convertHeadingSpy = vi.spyOn(convertHeadingUtils, 'convertHeading');

  // H1
  const h1Node = parseFragment('<h1>Heading</h1>').childNodes[0];

  await convertElement(h1Node, undefined);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h1Node, undefined);

  // H2
  const h2Node = parseFragment('<h2>Heading</h2>').childNodes[0];

  await convertElement(h2Node);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h2Node, undefined);

  // H3
  const h3Node = parseFragment('<h3>Heading</h3>').childNodes[0];

  await convertElement(h3Node);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h3Node, undefined);

  // H4
  const h4Node = parseFragment('<h4>Heading</h4>').childNodes[0];

  await convertElement(h4Node);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h4Node, undefined);

  // H5
  const h5Node = parseFragment('<h5>Heading</h5>').childNodes[0];

  await convertElement(h5Node);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h5Node, undefined);

  // H6
  const h6Node = parseFragment('<h6>Heading</h6>').childNodes[0];

  await convertElement(h6Node);

  expect(convertHeadingSpy).toHaveBeenCalledWith(h6Node, undefined);
});

it('should convert list tags', async () => {
  const convertUnorderedListSpy = vi.spyOn(convertUnorderedListsUtils, 'convertUnorderedList');
  const convertOrderedListSpy = vi.spyOn(convertOrderedListsUtils, 'convertOrderedList');

  // Unordered List
  const unorderedNode = parseFragment('<ul><li>item</li></ul>').childNodes[0];

  await convertElement(unorderedNode);

  expect(convertUnorderedListSpy).toHaveBeenCalledWith(unorderedNode, undefined);

  // Ordered List
  const orderedNode = parseFragment('<ol><li>item</li></ol>').childNodes[0];

  await convertElement(orderedNode);

  expect(convertOrderedListSpy).toHaveBeenCalledWith(orderedNode, undefined);
});

it('should convert image tags', async () => {
  const convertImageSpy = vi.spyOn(convertImageUtils, 'convertImage');
  const node = parseFragment('<img/>').childNodes[0];

  convertImageSpy.mockImplementationOnce(() => Promise.resolve(''));

  await convertElement(node);

  expect(convertImageSpy).toHaveBeenCalledWith(node, undefined);
});

it('should convert paragraph tags', async () => {
  const convertParagraphSpy = vi.spyOn(convertParagraphUtils, 'convertParagraph');
  const node = parseFragment('<p>Test</p>').childNodes[0];

  await convertElement(node);

  expect(convertParagraphSpy).toHaveBeenCalledWith(node, undefined);
});

it('should convert table tags without inner tbody', async () => {
  const convertTableSpy = vi.spyOn(convertTableUtils, 'convertTable');
  const node: ElementNode = parseFragment('<table><tr></tr></table>').childNodes[0] as ElementNode;

  convertTableSpy.mockImplementationOnce(() => '');

  await convertElement(node);

  expect(convertTableSpy).toHaveBeenCalledWith(node.childNodes[0], undefined);
});

it('should convert table tags with inner tbody', async () => {
  const convertTableSpy = vi.spyOn(convertTableUtils, 'convertTable');
  const node: ElementNode = parseFragment('<table><tbody><tr></tr></tbody></table>')
    .childNodes[0] as ElementNode;

  convertTableSpy.mockImplementationOnce(() => '');

  await convertElement(node);

  expect(convertTableSpy).toHaveBeenCalledWith(node.childNodes[0], undefined);
});

it('should not convert empty tables', async () => {
  const node: ElementNode = parseFragment('<table></table>').childNodes[0] as ElementNode;

  const tex = await convertElement(node);

  expect(tex).toBe(null);
});
