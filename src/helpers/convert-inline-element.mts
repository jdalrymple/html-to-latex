import { convertPlainText } from './convert-plain-text.mts';
import * as Template from '../templates.mts';
import type { Attribute, ChildNode, ConvertInlineElementOptions, TextNode } from '../types.mts';

export function convertInlineElement(
  node: ChildNode,
  { ignoreBreaks = true, ...options }: ConvertInlineElementOptions = {},
): string {
  const opts = { ignoreBreaks, ...options };
  // If this block has children, call fn on its child and obtain its value
  const innerText =
    'childNodes' in node && node.childNodes.length > 0
      ? node.childNodes.map((n) => convertInlineElement(n, opts)).join('')
      : '';

  switch (node.nodeName) {
    case '#text':
      return convertPlainText((node as unknown as TextNode).value, opts);
    case 'b':
    case 'strong':
      return Template.bold(innerText);
    case 'i':
    case 'em':
      return Template.italic(innerText);
    case 'u':
      return Template.underline(innerText);
    case 's':
      return Template.strikethrough(innerText);
    case 'sub':
      return Template.subscript(innerText);
    case 'sup':
      return Template.superscript(innerText);
    case 'br':
      return ignoreBreaks ? ' ' : '\n\n';
    case 'a':
      return Template.hyperlink(
        innerText,
        (node.attrs.find(({ name }) => name === 'href') as Attribute).value,
      );
    default:
      return innerText;
  }
}
