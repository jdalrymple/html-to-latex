import { nanoid as generateId } from 'nanoid';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { finished } from 'node:stream/promises';
import { basename, extname, join, resolve } from 'node:path';
import * as Template from '../templates.mts';
import type { Attribute, ConvertOptions, ElementNode } from '../types.mts';

export async function convertImage(
  node: ElementNode,
  { compilationDir = process.cwd(), ...options }: ConvertOptions = {} as ConvertOptions,
): Promise<string> {
  const imagesDir = resolve(compilationDir, 'images');
  const origPath = (node.attrs.find(({ name }) => name === 'src') as Attribute).value;
  const ext = extname(origPath) || '.jpg';
  const base = options.autogenImageNames ? `${generateId()}${ext}` : basename(origPath);
  const localPath = resolve(imagesDir, base);
  const localLatexPath = join('images', base);

  try {
    await stat(localPath);
  } catch (fsError) {
    try {
      await mkdir(imagesDir);

      const url = new URL(origPath);
      const { body } = await fetch(url.href);
      const fileStream = createWriteStream(localPath);

      await finished(Readable.fromWeb(body as ReadableStream<Uint8Array>).pipe(fileStream));
    } catch (processError) {
      if (options.debug) {
        console.debug(`URL: ${origPath}`);
        console.debug(processError);
      }
    }
  }

  return Template.image(localLatexPath, {
    width: options.imageWidth,
    height: options.imageHeight,
    keepRatio: options.keepImageAspectRatio,
    center: options.centerImages,
  });
}
