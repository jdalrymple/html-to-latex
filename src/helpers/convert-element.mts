import type { ChildNode, ConvertElementOptions } from '../types.mts';
import { convertInlineElement } from './convert-inline-element.mts';
import * as Template from '../templates.mts';
import { convertUnorderedList } from './convert-unordered-list.mts';
import { convertOrderedLists } from './convert-ordered-list.mts';
import { convertImage } from './convert-image.mts';
import { convertHeading } from './convert-heading.mts';
import { convertParagraph } from './convert-paragraph.mts';
import { convertTable } from './convert-table.mts';

export async function convertElement(
  node: ChildNode,
  options: ConvertElementOptions = {},
): Promise<string> {
  switch (node.nodeName) {
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

      return '';
    }
    case 'ul':
      return convertUnorderedList(node, options);
    case 'ol':
      return convertOrderedLists(node, options);
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
      if (node.childNodes.length === 0) break;
      if (node.childNodes[0].nodeName === 'tbody') return convertTable(node.childNodes[0], options);
      return convertTable(node, options);
    }
    case 'code':
      return Template.sourceCode(convertInlineElement(node, options).trim());
    default:
      return convertInlineElement(node, options);
  }

  return '';
}
