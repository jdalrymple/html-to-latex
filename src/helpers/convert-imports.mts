export function convertPackageImports(HTMLText: string): string[] {
  const pkgs: string[] = [];

  if (HTMLText.includes('\\cfrac')) pkgs.push('amsmath');
  if (HTMLText.includes('<img')) pkgs.push('graphicx');
  if (HTMLText.includes('\\therefore')) pkgs.push('amssymb');
  if (HTMLText.includes('<s>')) pkgs.push('ulem');
  if (HTMLText.includes('</a>')) pkgs.push('hyperref');
  if (HTMLText.includes('</code>')) pkgs.push('listings');

  return pkgs;
}
