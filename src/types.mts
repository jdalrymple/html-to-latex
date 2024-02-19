import type { DefaultTreeAdapterMap, Token } from 'parse5';

export interface ConvertOptions {
  preferDollarInlineMath?: boolean;
  ignoreBreaks?: boolean;
  compilationDir?: string;
  skipWrappingEquations?: boolean;
  autogenImageNames?: boolean;
  debug?: boolean;
  imageWidth?: string;
  imageHeight?: string;
  keepImageAspectRatio?: boolean;
  centerImages?: boolean;
  includedPackages?: string[];
  includeDocumentWrapper?: boolean;
  documentClass?: string;
  title?: string;
  author?: string;
  includeDate?: boolean;
}

export interface ConvertFileOptions extends ConvertOptions {
  outputFilePath?: string;
}

export type ElementNode = DefaultTreeAdapterMap['element'];

export type TextNode = DefaultTreeAdapterMap['textNode'];

export type ChildNode = DefaultTreeAdapterMap['childNode'];

export type Attribute = Token.Attribute;
