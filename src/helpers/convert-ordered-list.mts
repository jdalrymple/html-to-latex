import { convertList } from './convert-list.mts';
import * as Template from '../templates.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export async function convertOrderedList(
  node: ElementNode,
  options: ConvertOptions = {},
): Promise<string> {
  const list = await convertList(node, options);

  return Template.enumerate(list);
}
