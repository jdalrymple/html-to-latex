import { parseFragment } from 'parse5';
import { expect, test as it, vi } from 'vitest';
import { convertTable } from '../../../src/helpers/convert-table.mts';
import * as convertTableRowUtils from '../../../src/helpers/convert-table-row.mts';
import { ElementNode } from '../../../src/types.mts';

it('should only process tr tags from the passed node', () => {
  const convertTableRowSpy = vi.spyOn(convertTableRowUtils, 'convertTableRow');

  const node = parseFragment(
    '<tbody><tr><th>title</th><td>cell</td><span>Test</span></tr></tbody>',
  );

  const output = convertTable(node.childNodes[0] as ElementNode);

  expect(convertTableRowSpy).toBeCalledTimes(1);
  expect(output).toBe(
    '\\begin{tabular}{|c|c|}\n\t\\hline\n\ttitle & cell \\\\\n\t\\hline\n\\end{tabular}',
  );
});
