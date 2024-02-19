import { convertInlineElement } from './convert-inline-element.mts';
import * as Template from '../templates.mts';
import type { ChildNode, ConvertOptions } from '../types.mts';
import { convertUnorderedList } from './convert-unordered-list.mts';
import { convertOrderedLists } from './convert-ordered-list.mts';
import { convertImage } from './convert-image.mts';
import { convertHeading } from './convert-heading.mts';
import { convertParagraph } from './convert-paragraph.mts';
import { convertTable } from './convert-table.mts';

export async function convertBlockElement(
  nodes: ChildNode[],
  {
    autogenImageNames = true,
    includeDocumentWrapper = false,
    documentClass = 'article',
    includedPackages = [],
    compilationDir,
    ignoreBreaks = true,
    preferDollarInlineMath = false,
    skipWrappingEquations = false,
    debug = false,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    centerImages,
    title,
    includeDate,
    author,
  }: ConvertOptions = {},
): Promise<string> {
  const blockedNodes = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'img',
    'hr',
    'div',
    'body',
    'html',
    'header',
    'footer',
    'p',
    'table',
    'code',
  ];
  const doc: (Promise<string> | string)[] = [];
  let tempInlineDoc: (Promise<string> | string)[] = [];

  if (includeDocumentWrapper) {
    doc.push(Template.docClass(documentClass));

    if (includedPackages.length > 0) doc.push(Template.usePackages(includedPackages));

    doc.push(Template.beginDocument({ title, includeDate, author }));
  }

  const partialOptions: Partial<ConvertOptions> = {
    compilationDir,
    ignoreBreaks,
    preferDollarInlineMath,
    skipWrappingEquations,
    autogenImageNames,
    debug,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    centerImages,
  };

  nodes.forEach((node) => {
    if (!blockedNodes.includes(node.nodeName)) {
      tempInlineDoc.push(convertInlineElement(node, partialOptions));

      return;
    }

    if (tempInlineDoc.length > 0) {
      doc.push(Promise.all(tempInlineDoc).then((t) => t.join('').trim()));
      tempInlineDoc = [];
    }

    switch (node.nodeName) {
      case 'div':
      case 'section':
      case 'body':
      case 'html':
      case 'header':
      case 'footer':
      case 'aside':
        doc.push(
          convertBlockElement(node.childNodes, {
            ...partialOptions,
            includeDocumentWrapper: false,
          }),
        );
        break;
      case 'ul':
        doc.push(convertUnorderedList(node, partialOptions));
        break;
      case 'ol':
        doc.push(convertOrderedLists(node, partialOptions));
        break;
      case 'img':
        doc.push(convertImage(node, partialOptions));
        break;
      case 'hr':
        doc.push(Template.divider);
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        doc.push(convertHeading(node, partialOptions));
        break;
      case 'p':
        doc.push(convertParagraph(node, partialOptions));
        break;
      case 'table':
        if (node.childNodes.length === 0) break;
        if (node.childNodes[0].nodeName === 'tbody')
          doc.push(convertTable(node.childNodes[0], partialOptions));
        else doc.push(convertTable(node, partialOptions));
        break;
      case 'code':
        doc.push(Template.sourceCode(convertInlineElement(node, partialOptions).trim()));
        break;
      default:
    }
  });

  // Insert any left over inline nodes
  if (tempInlineDoc.length > 0) {
    doc.push(Promise.all(tempInlineDoc).then((t) => t.join('').trim()));
  }

  // Add document wrapper if configuration is set
  if (includeDocumentWrapper) doc.push(Template.endDocument);

  const converted = await Promise.all(doc);

  return converted.filter(Boolean).join('\n\n');
}
