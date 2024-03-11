import { parseFragment } from 'parse5';
import { expect, test as it, vi } from 'vitest';
import { convertTableRow } from '../../../src/helpers/convert-table-row.mts';
import * as convertInlineUtils from '../../../src/helpers/convert-inline-element.mts';
import { ElementNode } from '../../../src/types.mts';

it('should only process td and th tags from the passed node', () => {
  const convertInlineElementSpy = vi.spyOn(convertInlineUtils, 'convertInlineElement');

  const node = parseFragment('<tr><th>title</th><td>cell</td><span>Test</span></tr>');

  const output = convertTableRow(node.childNodes[0] as ElementNode);

  expect(convertInlineElementSpy).toBeCalledTimes(2);
  expect(output).toBe('title & cell \\\\\n');
});
