import { parseFragment } from 'parse5';
import { expect, describe, test as it, vi } from 'vitest';
import * as Template from '../../../src/templates.mts';
import { convertUnorderedList } from '../../../src/helpers/convert-unordered-list.mts';
import * as convertListUtils from '../../../src/helpers/convert-list.mts';
import { ElementNode } from '../../../src/types.mts';

describe('convertOrderedLists', () => {
  it('should parse out the li element children from the node using the convertList helper', async () => {
    const convertListSpy = vi.spyOn(convertListUtils, 'convertList');

    const node = parseFragment('<ul><li>one</li><li>two</li><span>three</span></ul>');

    await convertUnorderedList(node.childNodes[0] as ElementNode);

    expect(convertListSpy).toHaveBeenCalledWith(node.childNodes[0], {});
  });

  it('should use the itemize template for each of the converted li blocks', async () => {
    const templateSpy = vi.spyOn(Template, 'itemize');

    const node = parseFragment('<ul><li>one</li><li>two</li><span>three</span></ul>');

    await convertUnorderedList(node.childNodes[0] as ElementNode);

    expect(templateSpy).toHaveBeenCalledWith;
  });

  it('should convert the list elements using itemize environment', async () => {
    const node = parseFragment('<ul><li>one</li><li>two</li><span>three</span></ul>');

    const output = await convertUnorderedList(node.childNodes[0] as ElementNode);

    expect(output).toMatch('\\begin{itemize}\n\t\\item one\n\t\\item two\n\\end{itemize}');
  });
});
