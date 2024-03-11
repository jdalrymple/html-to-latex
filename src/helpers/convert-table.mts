import { convertTableRow } from './convert-table-row.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export function convertTable(node: ElementNode, options: ConvertOptions = {}): string {
  const rows = Array.from(node.childNodes).filter((n) => n.nodeName === 'tr');
  const processedRows = rows.map((row: ElementNode) => convertTableRow(row, options));

  return (
    `\\begin{tabular}{|${'c|'.repeat(processedRows[0].split('&').length)}}\n` +
    `\t\\hline\n\t${processedRows.join('\t\\hline\n\t')}\t\\hline\n` +
    `\\end{tabular}`
  );
}
