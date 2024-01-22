import { normalizeSafe } from 'upath';

export const nls = (text) => `${text}\n`;
export const nlp = (text) => `\n${text}`;

export const centerblk = (text) => `\\begin{center}\n\t${text}\n\\end{center}`;
export const centering = (text) => `\\centering{${text}}`;

export const section = (text) => `\\section*{${centering(text)}}`;
export const subsection = (text) => `\\subsection*{${text}}`;
export const subsubsection = (text) => `\\subsubsection*{${text}}`;

export const bold = (text) => `\\textbf{${text}}`;
export const italic = (text) => `\\textit{${text}}`;
export const underline = (text) => `\\underline{${text}}`;
export const strikethrough = (text) => `\\sout{${text}}`;
export const superscript = (text) => `$^{${text}}$`;
export const subscript = (text) => `$_{${text}}$`;

export const hyperlink = (text, url) => `\\href{${url}}{${text}}`;

export const divider = nls('\\hrule');

export const enumerate = (text) => `\\begin{enumerate}\n${text}\n\\end{enumerate}`;
export const itemize = (text) => `\\begin{itemize}\n${text}\n\\end{itemize}`;
export const item = (text) => `\t\\item ${text}`;
export function image(path, { width, height, keepRatio, center } = { center: true }) {
  const line = ['\\includegraphics'];
  const options = [];

  if (width) options.push(`width=${width}`);
  if (height) options.push(`height=${height}`);
  if ((width || height) && keepRatio) options.push('keepaspectratio');
  if (options.length) line.push(`[${options.join(',')}]`);

  line.push(`{${normalizeSafe(path)}}`);

  return center ? centerblk(line.join('')) : line.join('');
}

export function usePackages(packageNames) {
  return nls(packageNames.map((n) => `\\usepackage{${n}}`).join('\n'));
}

export function beginDocument({ title, includeDate = false, author } = {}) {
  const beginningText = [];

  if (title) beginningText.push(`\\title{${title}}`);
  if (author) beginningText.push(`\\author{${author}}`);
  if (includeDate) beginningText.push(`\\date{\\today}`);

  if (beginningText.length) beginningText.push(nlp(`\\begin{document}`));
  else beginningText.push(`\\begin{document}`);

  if (title) beginningText.push(nlp('\\maketitle'));

  return beginningText.join('\n');
}

export const endDocument = nlp('\\end{document}');
export const docClass = (className) => `\\documentclass{${className}}`;

export const escapeLatexSpecialChars = (match, p1) => {
  if (p1) return match;

  const latexSpecialCharsMap = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '%': '\\%',
  '$': '\\$',
  '&': '\\&',
  '#': '\\#',
  '^': '\\^{}',
  '_': '\\_',
  '~': '\\textasciitilde{}',
  '%': '\\%',
  '|': '\\textbar{}',
};

  return latexSpecialCharsMap[match] || match;
};
