import { parseFragment } from 'parse5';
import { expect, describe, test as it, vi } from 'vitest';
import * as Template from '../../../src/templates.mts';
import { convertList } from '../../../src/helpers/convert-list.mts';
import * as convertBlockElementUtils from '../../../src/helpers/convert-block-element.mts';
import { ElementNode } from '../../../src/types.mts';

describe('convertList', () => {
  it('should parse out the li element children from the node and convert its contents', async () => {
    const convertBlockElementSpy = vi.spyOn(convertBlockElementUtils, 'convertBlockElement');

    const node = parseFragment('<ul><li>one</li><li>two</li><span>three</span></ul>');

    const converted = await convertList(node.childNodes[0] as ElementNode);

    expect(convertBlockElementSpy).toHaveBeenCalledTimes(2);
    expect(converted).toMatch('\t\\item one\n\t\\item two');
  });

  it('should use the item template for each of the converted li blocks', async () => {
    const templateSpy = vi.spyOn(Template, 'item');

    const node = parseFragment('<ul><li>one</li><li>two</li><span>three</span></ul>');

    await convertList(node.childNodes[0] as ElementNode);

    expect(templateSpy).toHaveBeenCalledTimes(2);
  });
});
