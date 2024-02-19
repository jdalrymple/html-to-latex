import { convertInlineElement } from './convert-inline-element.mts';
import * as Template from '../templates.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export function convertHeading(node: ElementNode, options: ConvertOptions = {}): string {
  const text = convertInlineElement(node, options);

  switch (node.nodeName) {
    case 'h1':
      return Template.section(text);
    case 'h2':
      return Template.subsection(text);
    default:
      return Template.subsubsection(text);
  }
}
