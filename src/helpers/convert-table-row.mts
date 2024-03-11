import { convertInlineElement } from './convert-inline-element.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export function convertTableRow(node: ElementNode, options: ConvertOptions = {}): string {
  const cells: ElementNode[] = Array.from(node.childNodes).filter(
    (n) => n.nodeName === 'td' || n.nodeName === 'th',
  ) as ElementNode[];
  const processedCells = cells.map((cell) => convertInlineElement(cell, options));

  // LaTeX column separator & line end
  return `${processedCells.join(' & ')} \\\\\n`;
}
