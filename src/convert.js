import { parseFragment } from 'parse5';
import { decodeHTML } from 'entities';
import { outputFile, readFile, pathExists, ensureDir } from 'fs-extra';
import { resolve, basename, join, dirname, extname } from 'path';
import { stream } from 'got';
import { pipeline as pipelineSync } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { generate as generateId } from 'shortid';
import {
  docClass,
  usePackages,
  beginDocument,
  endDocument,
  section,
  subsection,
  subsubsection,
  bold,
  italic,
  underline,
  divider,
  itemize,
  enumerate,
  item,
  image,
} from './templates';

const pipeline = promisify(pipelineSync);

function analyzeForPackageImports(HTMLText) {
  const pkgs = [];

  if (HTMLText.includes('\\cfrac')) pkgs.push('amsmath');
  if (HTMLText.includes('<img')) pkgs.push('graphicx');
  if (HTMLText.includes('\\therefore')) pkgs.push('amssymb');

  return pkgs;
}

export async function exportFile(text, filename, path = process.cwd) {
  return outputFile(resolve(path, `${filename}.tex`), text);
}

async function convertImage(
  node,
  {
    compilationDir,
    autoGenImageNames = true,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    debug,
  } = {},
) {
  const imagesDir = resolve(compilationDir, 'images');
  const origPath = node.attrs.find(({ name }) => name === 'src').value;
  const ext = extname(origPath) || '.jpg';
  const base = autoGenImageNames ? `${generateId()}${ext}` : basename(origPath);
  const localPath = resolve(imagesDir, base);
  const localLatexPath = join('images', base);
  const exists = await pathExists(localPath);

  if (!exists) {
    try {
      const url = new URL(origPath);

      await ensureDir(imagesDir);

      await pipeline(stream(url.href), createWriteStream(localPath));
    } catch (e) {
      if (debug) {
        console.debug(`URL: ${origPath}`);
        console.debug(e);
      }
    }
  }

  return image(localLatexPath, imageWidth, imageHeight, keepImageAspectRatio);
}

function convertPlainText(value, opts) {
  const breakReplacement = opts.ignoreBreaks ? '' : '\n\n';
  const cleanText = value
    .replace(/(\n|\r)/g, breakReplacement) // Standardize line breaks or remove them
    .replace(/\t/g, '') // Remove tabs
    .replace(/(?<!\\)%/g, '\\%');
  const decodedText = decodeHTML(cleanText);

  return opts.preferDollarInlineMath ? decodedText.replace(/\\\(|\\\)/g, '$') : decodedText;
}

async function convertRichTextSingle(n, opts) {
  switch (n.nodeName) {
    case 'img':
      return convertImage(n, opts);
    case 'b':
    case 'strong':
      return convertRichText(n, opts).then((t) => bold(t));
    case 'i':
      return convertRichText(n, opts).then((t) => italic(t));
    case 'u':
      return convertRichText(n, opts).then((t) => underline(t));
    case 'br':
      return opts.ignoreBreaks ? ' ' : '\n\n';
    case 'span':
      return convertRichText(n, opts);
    case '#text':
      return convertPlainText(n.value, opts);
    default:
      return '';
  }
}

async function convertRichText(node, opts) {
  if (node.childNodes && node.childNodes.length > 0) {
    const converted = await Promise.all(node.childNodes.map((n) => convertRichTextSingle(n, opts)));
    return converted.join('');
  }

  return convertRichTextSingle(node, opts);
}

async function convertUnorderedLists({ childNodes }, opts) {
  const filtered = await childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(
    filtered.map((f) => convert([f], { ...opts, includeDocumentWrapper: false })),
  );
  const listItems = texts.map(item);

  return itemize(listItems.join('\n'));
}

async function convertOrderedLists({ childNodes }, opts) {
  const filtered = await childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(
    filtered.map((f) => convert([f], { ...opts, includeDocumentWrapper: false })),
  );
  const listItems = texts.map(item);

  return enumerate(listItems.join('\n'));
}

async function convertHeading(node, opts) {
  const text = await convertRichText(node, opts);

  switch (node.nodeName) {
    case 'h1':
      return section(text);
    case 'h2':
      return subsection(text);
    default:
      return subsubsection(text);
  }
}

export async function convert(
  nodes,
  {
    autoGenImageNames = true,
    includeDocumentWrapper = false,
    documentClass = 'article',
    includePackages = [],
    compilationDir = process.cwd(),
    ignoreBreaks = true,
    preferDollarInlineMath = false,
    skipWrappingEquations = false,
    debug = false,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    title,
    includeDate,
    author,
  } = {},
) {
  const blockedNodes = [
    'h1',
    'h2',
    'h3',
    'ul',
    'ol',
    'img',
    'hr',
    'div',
    'section',
    'body',
    'html',
    'header',
    'footer',
    'aside',
    'p',
  ];
  const doc = [];
  const opts = {
    compilationDir,
    ignoreBreaks,
    preferDollarInlineMath,
    skipWrappingEquations,
    autoGenImageNames,
    debug,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
  };
  let tempInlineDoc = [];

  if (includeDocumentWrapper) {
    doc.push(docClass(documentClass));

    if (includePackages.length > 0) doc.push(usePackages(includePackages));

    doc.push(beginDocument({ title, includeDate, author }));
  }

  nodes.forEach(async (n) => {
    if (!blockedNodes.includes(n.nodeName)) {
      tempInlineDoc.push(convertRichText(n, opts));
      return;
    }

    if (tempInlineDoc.length > 0) {
      doc.push(Promise.all(tempInlineDoc).then((t) => t.join('').trim()));
      tempInlineDoc = [];
    }

    switch (n.nodeName) {
      case 'h1':
      case 'h2':
      case 'h3':
        doc.push(convertHeading(n, opts));
        break;
      case 'ul':
        doc.push(convertUnorderedLists(n, opts));
        break;
      case 'ol':
        doc.push(convertOrderedLists(n, opts));
        break;
      case 'img':
        doc.push(convertImage(n, opts));
        break;
      case 'hr':
        doc.push(divider);
        break;
      case 'div':
      case 'section':
      case 'body':
      case 'html':
      case 'header':
      case 'footer':
      case 'aside':
        doc.push(
          convert(n.childNodes, {
            ...opts,
            includeDocumentWrapper: false,
          }),
        );
        break;
      case 'p':
        doc.push(
          convertRichText(n, opts).then((t) => {
            const trimmed = t.trim();

            // Check if text is only an equation. If so, switch \( \) & $ $, for \[ \]
            if (
              !opts.skipWrappingEquations &&
              trimmed.match(/^(\$|\\\()/) &&
              trimmed.match(/(\\\)|\$)$/)
            ) {
              const rewrapped = trimmed.replace(/^(\$|\\\()/, '\\[').replace(/(\\\)|\$)$/, '\\]');

              // TODO: Move all of this into the above regex check
              if (!rewrapped.includes('$')) return rewrapped;
            }

            return trimmed;
          }),
        );
        break;
      default:
    }
  });

  // Insert any left over inline nodes
  if (tempInlineDoc.length > 0) {
    doc.push(Promise.all(tempInlineDoc).then((t) => t.join('').trim()));
  }

  // Add document wrapper if configuration is set
  if (includeDocumentWrapper) doc.push(endDocument);

  const converted = await Promise.all(doc);

  return converted.filter(Boolean).join('\n\n');
}

export async function convertText(data, options = {}) {
  const root = await parseFragment(data);

  return convert(root.childNodes, {
    ...options,
    includePackages: options.includePackages || analyzeForPackageImports(data),
  });
}

export async function convertFile(filepath, { outputFilepath = filepath, ...options } = {}) {
  const data = await readFile(filepath, 'utf-8');
  const processed = await convertText(data, { includeDocumentWrapper: true, ...options });

  await exportFile(processed, outputFilepath, dirname(filepath));
}
