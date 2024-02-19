import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { convertText } from './convert-text.mts';
import type { ConvertFileOptions } from '../types.mts';

export async function convertFile(
  filePath: string,
  { outputFilePath = filePath, includeDocumentWrapper = true, ...options }: ConvertFileOptions,
): Promise<void> {
  const data = await readFile(filePath, 'utf-8');
  const processed = await convertText(data, { ...options, includeDocumentWrapper });
  const directory = dirname(outputFilePath);
  const cleanedOutputFilePath = outputFilePath.replace(extname(outputFilePath), '.tex');

  await mkdir(directory, { recursive: true });

  return writeFile(cleanedOutputFilePath, processed);
}
