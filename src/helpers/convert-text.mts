import { parseFragment } from 'parse5';
import { convertBlockElement } from './convert-block-element.mts';
import type { ConvertOptions } from '../types.mts';

export function analyzeForPackageImports(HTMLText: string): string[] {
  const pkgs: string[] = [];

  if (HTMLText.includes('\\cfrac')) pkgs.push('amsmath');
  if (HTMLText.includes('<img')) pkgs.push('graphicx');
  if (HTMLText.includes('\\therefore')) pkgs.push('amssymb');
  if (HTMLText.includes('<s>')) pkgs.push('ulem');
  if (HTMLText.includes('</a>')) pkgs.push('hyperref');
  if (HTMLText.includes('</code>')) pkgs.push('listings');

  return pkgs;
}

export async function convertText(
  htmlString: string,
  options: ConvertOptions = {},
): Promise<string> {
  const root = parseFragment(htmlString);

  return convertBlockElement(root.childNodes, {
    ...options,
    includedPackages: options.includedPackages || analyzeForPackageImports(htmlString),
  });
}
