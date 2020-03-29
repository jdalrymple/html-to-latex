import { normalize } from 'path';

export const nls = text => `${text}\n`;
export const nlp = text => `\n${text}`;
export const sp = text => ` ${text}`;

export const center = text => `\\begin{center}\n\t${text}\n\\end{center}`;
export const centering = text => `\\centering{${text}}`;

export const section = text => nls(`\\section*{${centering(text)}}`);
export const subsection = text => nls(`\\subsection*{${text}}`);
export const subsubsection = text => nls(`\\subsubsection*{${text}}`);

export const bold = text => `\\textbf{${text}}`;
export const italic = text => `\\textit{${text}}`;
export const underline = text => `\\underline{${text}}`;

export const divider = nls('\\hrule');
export const linebreak = text => `\\\\\n${text}`;

export const enumerate = text => nls(`\\begin{enumerate}\n${text}\n\\end{enumerate}`);
export const itemize = text => nls(`\\begin{itemize}\n${text}\n\\end{itemize}`);
export const item = text => `\t\\item ${text}`;
export const image = path => center(`\\includegraphics{${normalize(path)}}`);

export function usePackages(packageNames) {
  return nls(packageNames.map(n => `\\usepackage{${n}}`).join('\n'));
}

export function beginDocument({ title, includeDate = false, author } = {}) {
  const beginningText = [];

  if (title) beginningText.push(`\\title{${title}}`);
  if (author) beginningText.push(`\\author{${author}}`);
  if (includeDate) beginningText.push(`\\date{\\today}`);

  beginningText.push(`\\begin{document}`);

  if (title) beginningText.push('\\maketitle');

  return nls(beginningText.join('\n'));
}

export const endDocument = '\\end{document}';
export const documentClass = className => nls(`\\documentclass{${className}}`);
