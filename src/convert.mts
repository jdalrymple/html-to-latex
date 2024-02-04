import { createWriteStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { finished } from 'node:stream/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';
import { nanoid as generateId } from 'nanoid';
import { decodeHTML } from 'entities';
import * as Template from './templates.mts';

export interface ConvertOptions {
  preferDollarInlineMath?: boolean;
  ignoreBreaks?: boolean;
  compilationDir?: string;
  skipWrappingEquations?: boolean;
  autoGenImageNames?: boolean;
  debug?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  keepImageAspectRatio?: boolean;
  centerImages?: boolean;
  includePackages?: string[];
  includeDocumentWrapper?: boolean;
  documentClass?: string;
  title?: string;
  author?: string;
  includeDate?: boolean;
}

export interface ConvertFileOptions extends ConvertOptions {
  outputFilePath: string;
}

export type ElementNode = DefaultTreeAdapterMap['element'];

export type TextNode = DefaultTreeAdapterMap['textNode'];

export type ChildNode = DefaultTreeAdapterMap['childNode'];

export type Attribute = Token.Attribute;

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

export async function convertImage(
  node: ElementNode,
  { compilationDir = process.cwd(), ...options }: ConvertOptions = {} as ConvertOptions,
): Promise<string> {
  const imagesDir = resolve(compilationDir, 'images');
  const origPath = (node.attrs.find(({ name }) => name === 'src') as Attribute).value;
  const ext = extname(origPath) || '.jpg';
  const base = options.autoGenImageNames ? `${generateId()}${ext}` : basename(origPath);
  const localPath = resolve(imagesDir, base);
  const localLatexPath = join('images', base);
  const exists = await stat(localPath);

  if (!exists.isFile()) {
    try {
      await mkdir(imagesDir);

      const url = new URL(origPath);
      const { body } = await fetch(url.href);
      const fileStream = createWriteStream(localPath);

      await finished(Readable.fromWeb(body as ReadableStream<Uint8Array>).pipe(fileStream));
    } catch (e) {
      if (options.debug) {
        console.debug(`URL: ${origPath}`);
        console.debug(e);
      }
    }
  }

  return Template.image(localLatexPath, {
    width: options.imageWidth,
    height: options.imageHeight,
    keepRatio: options.keepImageAspectRatio,
    center: options.centerImages,
  });
}

export function convertPlainText(inputText: string, options: ConvertOptions): string {
  const breakReplacement = options.ignoreBreaks ? '' : '\n\n';
  const cleanText = inputText
    .replace(/(\n|\r)/g, breakReplacement) // Standardize line breaks or remove them
    .replace(/\t/g, '') // Remove tabs
    // .replace(/\\(?!\\|%|&|_|\$|#|\{|\}|~|\^|<|>|"|\|)/g, '\\textbackslash{}')
    .replace(/(\\)([%&#~<>|])|([%&#~<>|])/g, Template.escapeLatexSpecialChars);
  // Ideally, we would check for all special characters, e.g., /(\\)([%&_$#{}~^<>|"])|([%&_$#{}~^<>|"])/g
  // However, we are currently allowing equations to be written in the HTML file.

  const decodedText = decodeHTML(cleanText);

  return options.preferDollarInlineMath ? Template.inlineMath(decodedText) : decodedText;
}

export async function convertRichTextSingle(
  node: ChildNode,
  options: ConvertOptions,
): Promise<string> {
  switch (node.nodeName) {
    case 'img':
      return convertImage(node as unknown as ElementNode, options);
    case 'b':
    case 'strong':
      return convertRichText(node, options).then((t: string) => Template.bold(t));
    case 'i':
    case 'em':
      return convertRichText(node, options).then((t: string) => Template.italic(t));
    case 'u':
      return convertRichText(node, options).then((t: string) => Template.underline(t));
    case 's':
      return convertRichText(node, options).then((t: string) => Template.strikethrough(t));
    case 'sub':
      return convertRichText(node, options).then((t: string) => Template.subscript(t));
    case 'sup':
      return convertRichText(node, options).then((t: string) => Template.superscript(t));
    case 'br':
      return options.ignoreBreaks ? ' ' : '\n\n';
    case 'a':
      return convertRichText(node as unknown as ElementNode, options).then((t: string) =>
        Template.hyperlink(t, (node.attrs.find(({ name }) => name === 'href') as Attribute).value),
      );
    case '#text':
      return convertPlainText((node as unknown as TextNode).value, options);
    default:
      // we allow unknown tags to pass through
      // CHECKME: Should they be allowed to pass, or just return empty string - Feels like an infinite loop situation
      return convertRichText(node as ElementNode, options);
  }
}

export async function convertRichText(node: ChildNode, options: ConvertOptions): Promise<string> {
  if ('childNodes' in node && node.childNodes.length > 0) {
    const converted = await Promise.all(
      node.childNodes.map((n: ChildNode) => convertRichTextSingle(n, options)),
    );

    return converted.join('');
  }

  return convertRichTextSingle(node, options);
}

export async function convertUnorderedLists(
  node: ElementNode,
  options: ConvertOptions,
): Promise<string> {
  const filtered = node.childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(
    filtered.map((f) => convert([f], { ...options, includeDocumentWrapper: false })),
  );
  const listItems = texts.map(Template.item);

  return Template.itemize(listItems.join('\n'));
}

export async function convertOrderedLists(
  node: ElementNode,
  options: ConvertOptions,
): Promise<string> {
  const filtered = node.childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(
    filtered.map((f) => convert([f], { ...options, includeDocumentWrapper: false })),
  );
  const listItems = texts.map(Template.item);

  return Template.enumerate(listItems.join('\n'));
}

export async function convertHeading(node: ElementNode, options: ConvertOptions): Promise<string> {
  const text = await convertRichText(node, options);

  switch (node.nodeName) {
    case 'h1':
      return Template.section(text);
    case 'h2':
      return Template.subsection(text);
    default:
      return Template.subsubsection(text);
  }
}

export async function convertTable(node: ElementNode, options: ConvertOptions): Promise<string> {
  const rows = Array.from(node.childNodes).filter((n) => n.nodeName === 'tr');
  const processedRows = await Promise.all(rows.map((row: ElementNode) => convertTableRow(row, options)));

  return (
    `\\begin{tabular}{|${'c|'.repeat(processedRows[0].split('&').length)}}\n` +
    `\t\\hline\n\t${processedRows.join('\t\\hline\n\t')}\t\\hline\n\t` +
    `\\end{tabular}`
  );
}

export async function processTableCells(
  nodes: ElementNode[],
  options: ConvertOptions,
): Promise<string[]> {
  return Promise.all(nodes.map((node) => convertRichText(node, options)));
}

export async function convertTableRow(node: ElementNode, options: ConvertOptions): Promise<string> {
  const cells: ElementNode[] = Array.from(node.childNodes).filter(
    (n) => n.nodeName === 'td' || n.nodeName === 'th',
  ) as ElementNode[];
  const processedCells = await processTableCells(cells, options);

  return `${processedCells.join(' & ')} \\\\\n`; // LaTeX column separator & line end
}

export async function convertParagraphTag(
  node: ElementNode,
  options: ConvertOptions,
): Promise<string> {
  const convertedRichText = await convertRichText(node, options);
  const trimmed = convertedRichText.trim();

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

export async function exportFile(
  text: string,
  filename: string,
  path = process.cwd(),
): Promise<void> {
  await mkdir(path, { recursive: true });

  return writeFile(resolve(path, `${filename}.tex`), text);
}

export async function convert(
  nodes: ChildNode[],
  {
    autoGenImageNames = true,
    includeDocumentWrapper = false,
    documentClass = 'article',
    includePackages = [],
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

    if (includePackages.length > 0) doc.push(Template.usePackages(includePackages));

    doc.push(Template.beginDocument({ title, includeDate, author }));
  }

  const partialOptions: Partial<ConvertOptions> = {
    compilationDir,
    ignoreBreaks,
    preferDollarInlineMath,
    skipWrappingEquations,
    autoGenImageNames,
    debug,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    centerImages,
  };

  nodes.forEach((node) => {
    if (!blockedNodes.includes(node.nodeName)) {
      tempInlineDoc.push(convertRichText(node, partialOptions));

      return;
    }

    if (tempInlineDoc.length > 0) {
      doc.push(Promise.all(tempInlineDoc).then((t) => t.join('').trim()));
      tempInlineDoc = [];
    }

    switch (node.nodeName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        doc.push(convertHeading(node, partialOptions));
        break;
      case 'ul':
        doc.push(convertUnorderedLists(node, partialOptions));
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
      case 'div':
      case 'section':
      case 'body':
      case 'html':
      case 'header':
      case 'footer':
      case 'aside':
        doc.push(convert(node.childNodes, { ...partialOptions, includeDocumentWrapper: false }));
        break;
      case 'p':
        doc.push(convertParagraphTag(node, partialOptions));
        break;
      case 'table':
        if (node.childNodes.length === 0) break;
        if (node.childNodes[0].nodeName === 'tbody')
          doc.push(convertTable(node.childNodes[0], partialOptions));
        else doc.push(convertTable(node, partialOptions));
        break;
      case 'code':
        doc.push(convertRichText(node, partialOptions).then((t) => Template.sourceCode(t.trim())));
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

export async function convertText(
  htmlString: string,
  options: ConvertOptions = {},
): Promise<string> {
  const root = parseFragment(htmlString);

  return convert(root.childNodes, {
    ...options,
    includePackages: options.includePackages || analyzeForPackageImports(htmlString),
  });
}

export async function convertFile(
  filePath: string,
  { outputFilePath = filePath, ...options }: ConvertFileOptions,
): Promise<void> {
  const data = await readFile(filePath, 'utf-8');
  const processed = await convertText(data, { ...options, includeDocumentWrapper: true });

  await exportFile(processed, outputFilePath, dirname(filePath));
}
