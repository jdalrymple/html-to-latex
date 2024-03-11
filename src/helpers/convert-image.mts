import { nanoid as generateId } from 'nanoid';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { finished } from 'node:stream/promises';
import { basename, extname, join, resolve } from 'node:path';
import * as Template from '../templates.mts';
import type { Attribute, ConvertImageOptions, ElementNode } from '../types.mts';

export async function convertImage(
  node: ElementNode,
  {
    compilationDir = process.cwd(),
    autogenImageNames = false,
    debug = false,
    imageWidth,
    imageHeight,
    keepImageAspectRatio,
    centerImages,
  } = {} as ConvertImageOptions,
): Promise<string | null> {
  const origPath = (node.attrs.find(({ name }) => name === 'src') as Attribute)?.value;

  if (!origPath) return null;

  const imagesDir = resolve(compilationDir, 'images');
  const ext = extname(origPath) || '.jpg';
  const base = autogenImageNames ? `${generateId()}${ext}` : basename(origPath);
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
      if (debug) {
        console.debug(`URL: ${origPath}`);
        console.debug(processError);
      }
    }
  }

  return Template.image(localLatexPath, {
    width: imageWidth,
    height: imageHeight,
    keepRatio: keepImageAspectRatio,
    center: centerImages,
  });
}
