import { convertElement } from './convert-element.mts';
import * as Template from '../templates.mts';
import type { ConvertElementOptions, ElementNode } from '../types.mts';

export async function convertList(
  node: ElementNode,
  options: ConvertElementOptions = {},
): Promise<string> {
  const filtered = node.childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(filtered.map((f) => convertElement(f, options)));

  return texts.map(Template.item).join('\n');
}
