import { parseFragment } from 'parse5';
import { decodeHTML } from 'entities';
import { outputFile, readFile, pathExists, ensureDir } from 'fs-extra';
import { resolve, basename, join, dirname } from 'path';
import { stream } from 'got';
import { pipeline as pipelineSync } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import {
  documentClass,
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
  linebreak,
  itemize,
  enumerate,
  item,
  image,
  nls,
  sp,
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

async function convertImage(node, { compilationDir } = {}) {
  const origPath = node.attrs.find(a => a.name === 'src').value;
  const base = basename(origPath);
  const imagesDir = resolve(compilationDir, 'images');
  const localPath = resolve(imagesDir, base);
  const localLatexPath = join('images', base);
  const exists = await pathExists(localPath);

  if (!exists) {
    try {
      const url = new URL(origPath);

      await ensureDir(imagesDir);

      await pipeline(stream(url.href), createWriteStream(localPath));
    } catch (e) {
      // Path isnt a url
    }
  }

  return image(localLatexPath);
}

async function convertRichText({ childNodes }, opts) {
  const text = [];

  childNodes.forEach(async n => {
    switch (n.nodeName) {
      case '#text':
        text.push(decodeHTML(n.value.replace(/(\n|\t|\r)/g, '')));
        break;
      case 'img':
        text.push(convertImage(n, opts));
        break;
      default:
        text.push(convertPlainText(n, opts));
    }
  });

  const converted = await Promise.all(text);

  return converted.join('');
}

async function convertPlainText(node, opts) {
  const text = await convertRichText(node, opts);

  switch (node.nodeName) {
    case 'b':
    case 'strong':
      return bold(text);
    case 'i':
      return italic(text);
    case 'u':
      return underline(text);
    case 'br':
      if (opts.ignoreBreaks) return sp(text);
      return linebreak(text);
    default:
      return text;
  }
}

async function convertUnorderedLists({ childNodes }, opts) {
  const filtered = await childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(filtered.map(f => convertRichText(f, opts)));
  const listItems = texts.map(t => item(t));

  return itemize(listItems.join('\n'));
}

async function convertOrderedLists({ childNodes }, opts) {
  const filtered = await childNodes.filter(({ nodeName }) => nodeName === 'li');
  const texts = await Promise.all(filtered.map(f => convertRichText(f, opts)));
  const listItems = texts.map(t => item(t));

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

async function convert(
  nodes,
  {
    includeDocumentWrapper = true,
    docClass = 'article',
    includePkgs = [],
    compilationDir = process.cwd(),
    ignoreBreaks = true,
    title,
    includeDate,
    author,
  } = {},
) {
  const doc = [];
  const opts = {
    compilationDir,
    ignoreBreaks,
  };

  if (includeDocumentWrapper) {
    doc.push(documentClass(docClass));

    if (includePkgs.length > 0) doc.push(usePackages(includePkgs));

    doc.push(beginDocument({ title, includeDate, author }));
  }

  nodes.forEach(async n => {
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
        doc.push(convertImage(n, opts).then(i => nls(i)));
        break;
      case 'p':
        doc.push(convertRichText(n, opts).then(t => nls(t)));
        break;
      case 'hr':
        doc.push(divider);
        break;
      case 'div':
      case 'section':
        doc.push(
          convert(n.childNodes, {
            ...opts,
            includeDocumentWrapper: false,
          }),
        );
        break;
      default:
    }
  });

  if (includeDocumentWrapper) doc.push(endDocument);

  const converted = await Promise.all(doc);

  return converted.join('\n');
}

export async function convertText(data, options = {}) {
  const nodes = await parseFragment(data).childNodes;

  return convert(nodes, {
    ...options,
    includePackages: options.includePackages || analyzeForPackageImports(data),
  });
}

export async function convertFile(filepath, { outputFileName = filepath, ...options } = {}) {
  const data = await readFile(filepath, 'utf-8');
  const processed = await convertText(data, options);

  await exportFile(processed, outputFileName, dirname(filepath));
}
