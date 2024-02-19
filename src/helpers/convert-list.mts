import { convertBlockElement } from './convert-block-element.mts';
import * as Template from '../templates.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export async function convertList(
  node: ElementNode,
  options: ConvertOptions = {},
): Promise<string> {
  const filtered = node.childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(
    filtered.map((f) => convertBlockElement([f], { ...options, includeDocumentWrapper: false })),
  );

  return texts.map(Template.item).join('\n');
}
