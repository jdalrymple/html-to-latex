import { parseFragment } from 'parse5';
import * as Template from '../templates.mts';
import type { ConvertOptions } from '../types.mts';
import { convertElement } from './convert-element.mts';
import { convertPackageImports } from './convert-imports.mts';

export async function convertText(
  htmlString: string,
  {
    includeDocumentWrapper = false,
    documentClass = 'article',
    includePackages = [],
    includeDate = false,
    title,
    author,
    ...options
  }: ConvertOptions = {},
): Promise<string> {
  const root = parseFragment(htmlString);
  const doc: (Promise<string> | string | null)[] = [];

  if (includeDocumentWrapper) {
    doc.push(Template.docClass(documentClass));

    const packageImports =
      includePackages.length > 0 ? includePackages : convertPackageImports(htmlString);

    if (packageImports.length > 0) doc.push(Template.usePackages(packageImports));

    doc.push(Template.beginDocument({ title, includeDate, author }));
  }

  // Convert children
  const convertedElements = await Promise.all(
    root.childNodes.map((n) => convertElement(n, options)),
  );

  doc.push(...convertedElements.filter(Boolean));

  // Add document wrapper if configuration is set
  if (includeDocumentWrapper) doc.push(Template.endDocument());

  const converted = await Promise.all(doc);

  return converted.join(Template.blockSeperator);
}
