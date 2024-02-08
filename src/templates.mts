import { normalizeSafe } from 'upath';

export const newLineSuffix = (text: string): string => `${text}\n`;

export const newLinePrefix = (text: string): string => `\n${text}`;

export const centerblk = (text: string): string => `\\begin{center}\n\t${text}\n\\end{center}`;

export const centering = (text: string): string => `\\centering{${text}}`;

export const section = (text: string): string => `\\section*{${centering(text)}}`;

export const subsection = (text: string): string => `\\subsection*{${text}}`;

export const subsubsection = (text: string): string => `\\subsubsection*{${text}}`;

export const bold = (text: string): string => `\\textbf{${text}}`;

export const italic = (text: string): string => `\\textit{${text}}`;

export const underline = (text: string): string => `\\underline{${text}}`;

export const strikethrough = (text: string): string => `\\sout{${text}}`;

export const superscript = (text: string): string => `$^{${text}}$`;

export const subscript = (text: string): string => `$_{${text}}$`;

export const hyperlink = (text: string, url: string): string => `\\href{${url}}{${text}}`;

export const divider = newLineSuffix('\\hrule');

export const enumerate = (text: string): string => `\\begin{enumerate}\n${text}\n\\end{enumerate}`;

export const itemize = (text: string): string => `\\begin{itemize}\n${text}\n\\end{itemize}`;

export const item = (text: string): string => `\t\\item ${text}`;

export const inlineMath = (text: string): string => text.replace(/\\\(|\\\)/g, '$');

export const sourceCode = (text: string): string =>
  `\\begin{lstlisting}\n${text}\n\\end{lstlisting}`;

export const wrappedMath = (text: string): string =>
  text.replace(/^(\$|\\\()/, '\\[').replace(/(\\\)|\$)$/, '\\]');

export function image(
  filePath: string,
  {
    width,
    height,
    keepRatio,
    center = true,
  }: { width?: string; height?: string; keepRatio?: boolean; center?: boolean } = {},
): string {
  const line = ['\\includegraphics'];
  const options: string[] = [];

  if (width) options.push(`width=${width}`);
  if (height) options.push(`height=${height}`);
  if ((width || height) && keepRatio) options.push('keepaspectratio');
  if (options.length) line.push(`[${options.join(',')}]`);

  line.push(`{${normalizeSafe(filePath)}}`);

  return center ? centerblk(line.join('')) : line.join('');
}

export function usePackages(packageNames: string[]): string {
  return newLineSuffix(packageNames.map((n) => `\\usepackage{${n}}`).join('\n'));
}

export function beginDocument({
  title,
  author,
  includeDate,
}: {
  title?: string;
  author?: string;
  includeDate?: boolean;
}): string {
  const beginningText: string[] = [];

  if (title) beginningText.push(`\\title{${title}}`);
  if (author) beginningText.push(`\\author{${author}}`);
  if (includeDate) beginningText.push(`\\date{\\today}`);

  if (beginningText.length) beginningText.push(newLinePrefix(`\\begin{document}`));
  else beginningText.push(`\\begin{document}`);

  if (title) beginningText.push(newLinePrefix('\\maketitle'));

  return beginningText.join('\n');
}

export const endDocument = newLinePrefix('\\end{document}');

export const docClass = (className: string): string => `\\documentclass{${className}}`;

export const latexSpecialCharacter = (specialCharacter: string): string => {
  const latexSpecialCharsMap: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '%': '\\%',
    $: '\\$',
    '&': '\\&',
    '#': '\\#',
    '^': '\\^{}',
    _: '\\_',
    '~': '\\textasciitilde{}',
    '|': '\\textbar{}',
  };

  return latexSpecialCharsMap[specialCharacter] || specialCharacter;
};
