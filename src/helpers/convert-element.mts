import type { ChildNode, ConvertElementOptions, ElementNode } from '../types.mts';
import { convertInlineElement } from './convert-inline-element.mts';
import * as Template from '../templates.mts';
import { convertUnorderedList } from './convert-unordered-list.mts';
import { convertOrderedList } from './convert-ordered-list.mts';
import { convertImage } from './convert-image.mts';
import { convertHeading } from './convert-heading.mts';
import { convertParagraph } from './convert-paragraph.mts';
import { convertTable } from './convert-table.mts';

export async function convertElement(
  node: ChildNode,
  options?: ConvertElementOptions,
): Promise<string | null> {
  if (!node?.nodeName) return null;

  switch (node.nodeName) {
    case 'main':
    case 'div':
    case 'section':
    case 'body':
    case 'html':
    case 'header':
    case 'footer':
    case 'aside': {
      if ('childNodes' in node && node.childNodes.length > 0) {
        const nestedBlocks = await Promise.all(
          node.childNodes.map((n) => convertElement(n, options)),
        );

        return nestedBlocks.filter(Boolean).join(Template.blockSeperator);
      }

      return null;
    }
    case 'ul':
      return convertUnorderedList(node, options);
    case 'ol':
      return convertOrderedList(node, options);
    case 'img':
      return convertImage(node, options);
    case 'hr':
      return Template.divider();
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return convertHeading(node, options);
    case 'p':
      return convertParagraph(node, options);
    case 'table': {
      if (node.childNodes.length === 0) return null;

      // A tbody is always added even when missing from the original html
      return convertTable(node?.childNodes[0] as ElementNode, options);
    }
    case 'code':
      return Template.sourceCode(convertInlineElement(node, options).trim());
    default:
      return convertInlineElement(node, options);
  }
}
