import { convertInlineElement } from './convert-inline-element.mts';
import * as Template from '../templates.mts';
import type { ConvertOptions, ElementNode } from '../types.mts';

export function convertParagraph(node: ElementNode, options: ConvertOptions = {}): string {
  const convertedInlineText = convertInlineElement(node, options);
  const trimmed = convertedInlineText.trim();

  // Check if text is only an equation. If so, switch \( \) & $ $, for \[ \]
  if (
    !options.skipWrappingEquations &&
    trimmed.match(/^(\$|\\\()/) &&
    trimmed.match(/(\\\)|\$)$/)
  ) {
    const rewrapped = Template.wrappedMath(trimmed);

    // TODO: Move all of this into the above regex check
    if (!rewrapped.includes('$')) return rewrapped;
  }

  return trimmed;
}
