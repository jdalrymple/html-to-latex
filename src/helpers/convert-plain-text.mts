import { decodeHTML } from 'entities';
import * as Template from '../templates.mts';

export function convertPlainText(
  inputText: string,
  { ignoreBreaks = true, preferDollarInlineMath = false } = {},
): string {
  const breakReplacement = ignoreBreaks ? '' : '\n\n';
  const cleanText = inputText
    .replace(/(\n|\r)+/g, '\n') // Standardize line breaks
    .replace(/\n/g, breakReplacement) // Standardize through double breaks or remove them
    .replace(/\t/g, '') // Remove tabs
    // .replace(/\\(?!\\|%|&|_|\$|#|\{|\}|~|\^|<|>|"|\|)/g, '\\textbackslash{}')
    .replace(/(\\)([%&#~<>|])|([%&#~<>|])/g, Template.latexSpecialCharacter);
  // Ideally, we would check for all special characters, e.g., /(\\)([%&_$#{}~^<>|"])|([%&_$#{}~^<>|"])/g
  // However, we are currently allowing equations to be written in the HTML file.

  const decodedText = decodeHTML(cleanText);

  return preferDollarInlineMath ? Template.inlineMath(decodedText) : decodedText;
}
