import type { DefaultTreeAdapterMap, Token } from 'parse5';

export type ConvertDocumentOptions = {
  includePackages?: string[];
  includeDocumentWrapper?: boolean;
  documentClass?: string;
  title?: string;
  author?: string;
  includeDate?: boolean;
};

export type ConvertInlineElementOptions = {
  preferDollarInlineMath?: boolean;
  ignoreBreaks?: boolean;
};

export type ConvertImageOptions = {
  compilationDir?: string;
  autogenImageNames?: boolean;
  debug?: boolean;
  imageWidth?: string;
  imageHeight?: string;
  keepImageAspectRatio?: boolean;
  centerImages?: boolean;
};

export type ConvertParagraphOptions = {
  skipWrappingEquations?: boolean;
};

export type ConvertElementOptions = ConvertInlineElementOptions &
  ConvertImageOptions &
  ConvertParagraphOptions;

export type ConvertOptions = ConvertDocumentOptions &
  ConvertInlineElementOptions &
  ConvertImageOptions &
  ConvertParagraphOptions;

export type ConvertFileOptions = ConvertOptions & {
  outputFilePath?: string;
};

export type ElementNode = DefaultTreeAdapterMap['element'];

export type TextNode = DefaultTreeAdapterMap['textNode'];

export type ChildNode = DefaultTreeAdapterMap['childNode'];

export type Attribute = Token.Attribute;
