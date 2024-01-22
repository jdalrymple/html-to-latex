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
  strikethrough,
  superscript,
  subscript,
  hyperlink,
  divider,
  itemize,
  enumerate,
  item,
  image,
  escapeLatexSpecialChars
} from './templates';

const pipeline = promisify(pipelineSync);

function analyzeForPackageImports(HTMLText) {
  const pkgs = [];

  if (HTMLText.includes('\\cfrac')) pkgs.push('amsmath');
  if (HTMLText.includes('<img')) pkgs.push('graphicx');
  if (HTMLText.includes('\\therefore')) pkgs.push('amssymb');
  if (HTMLText.includes('<s>')) pkgs.push('ulem');
  if (HTMLText.includes('</a>')) pkgs.push('hyperref');
  if (HTMLText.includes('</code>')) pkgs.push('listings');

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
    centerImages = true,
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

  return image(localLatexPath, {
    width: imageWidth,
    height: imageHeight,
    keepRatio: keepImageAspectRatio,
    center: centerImages,
  });
}


function convertPlainText(value, opts) {
  const breakReplacement = opts.ignoreBreaks ? '' : '\n\n';
  const cleanText = value
    .replace(/(\n|\r)/g, breakReplacement) // Standardize line breaks or remove them
    .replace(/\t/g, '') // Remove tabs
    // .replace(/\\(?!\\|%|&|_|\$|#|\{|\}|~|\^|<|>|"|\|)/g, '\\textbackslash{}')
    .replace(/(\\)([%&#~<>\|])|([%&#~<>\|])/g, escapeLatexSpecialChars);
    // Ideally, we would check for all special characters, e.g., /(\\)([%&_$#{}~^<>|"])|([%&_$#{}~^<>|"])/g
    // However, we are currently allowing equations to be written in the HTML file.

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
    case 'em':
      return convertRichText(n, opts).then((t) => italic(t));
    case 'u':
      return convertRichText(n, opts).then((t) => underline(t));
    case 's':
      return convertRichText(n, opts).then((t) => strikethrough(t));
    case 'sub':
      return convertRichText(n, opts).then((t) => subscript(t));
    case 'sup':
      return convertRichText(n, opts).then((t) => superscript(t));
    case 'br':
      return opts.ignoreBreaks ? ' ' : '\n\n';
    case 'a':
      return convertRichText(n, opts).then((t) => hyperlink(t, n.attrs.find(({ name }) => name === 'href').value));
    case '#text':
      return convertPlainText(n.value, opts);
    default:
      // we allow unknown tags to pass through
      return convertRichText(n, opts);
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
    centerImages,
    title,
    includeDate,
    author,
  } = {},
) {
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
    'code'
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
    centerImages,
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
      case 'h4':
      case 'h5':
      case 'h6':
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
      case 'table':
        if (n.childNodes.length === 0) 
          break;
        if (n.childNodes[0].nodeName == 'tbody')
          doc.push(convertTable(n.childNodes[0], opts));
        else
          doc.push(convertTable(n, opts));
        break;
      case 'code':
        doc.push(
          convertRichText(n, opts).then((t) => {
            const trimmed = t.trim();
            return '\\begin{lstlisting}\n' + trimmed + '\n\\end{lstlisting}';
          }),
        );
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

async function convertTable(node, opts) {
  const rows = Array.from(node.childNodes).filter(n => n.nodeName === 'tr');
  const processedRows = await Promise.all(rows.map(row => convertTableRow(row, opts)));
  return '\\begin{tabular}{|' + 'c|'.repeat(processedRows[0].split('&').length) + '}\n' + 
         '\t\\hline\n\t' + processedRows.join('\t\\hline\n\t') + '\t\\hline\n\t' + '\\end{tabular}';
}

async function processTableCells(cells, opts) {
  return Promise.all(cells.map(cell => convertRichText(cell, opts)));
}

async function convertTableRow(row, opts) {
  const cells = Array.from(row.childNodes).filter(n => n.nodeName === 'td' || n.nodeName === 'th');
  const processedCells = await processTableCells(cells, opts);
  return processedCells.join(' & ') + ' \\\\\n'; // LaTeX column separator & line end
}