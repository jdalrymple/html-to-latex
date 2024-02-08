import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

export async function exportFile(
  text: string,
  filename: string,
  path = process.cwd(),
): Promise<void> {
  await mkdir(path, { recursive: true });

  return writeFile(resolve(path, `${filename}.tex`), text);
}
