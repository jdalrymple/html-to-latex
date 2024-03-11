import { parseFragment } from 'parse5';
import { expect, test as it, vi } from 'vitest';
import * as Template from '../../../src/templates.mts';
import { convertOrderedList } from '../../../src/helpers/convert-ordered-list.mts';
import * as convertListUtils from '../../../src/helpers/convert-list.mts';
import { ElementNode } from '../../../src/types.mts';

it('should parse out the li element children from the node using the convertList helper', async () => {
  const convertListSpy = vi.spyOn(convertListUtils, 'convertList');

  const node = parseFragment('<ol><li>one</li><li>two</li><span>three</span></ol>');

  await convertOrderedList(node.childNodes[0] as ElementNode);

  expect(convertListSpy).toHaveBeenCalledWith(node.childNodes[0], {});
});

it('should use the enumerate template for each of the converted li blocks', async () => {
  const templateSpy = vi.spyOn(Template, 'enumerate');

  const node = parseFragment('<ol><li>one</li><li>two</li><span>three</span></ol>');

  await convertOrderedList(node.childNodes[0] as ElementNode);

  expect(templateSpy).toHaveBeenCalledWith;
});

it('should convert the list elements using enumerate environment', async () => {
  const node = parseFragment('<ol><li>one</li><li>two</li><span>three</span></ol>');

  const output = await convertOrderedList(node.childNodes[0] as ElementNode);

  expect(output).toMatch('\\begin{enumerate}\n\t\\item one\n\t\\item two\n\\end{enumerate}');
});
