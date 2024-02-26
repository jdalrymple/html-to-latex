import { expect, describe, test as it, vi } from 'vitest';
import { PassThrough, Readable } from 'node:stream';
import * as FS from 'node:fs';
import type { WriteStream } from 'node:fs';
import * as FSp from 'node:fs/promises';
import { resolve } from 'node:path';
import * as NanoId from 'nanoid';
import { convertImage } from '../../../src/helpers/convert-image.mts';
import type { ElementNode } from '../../../src/types.mts';
import * as Template from '../../../src/templates.mts';

describe('convertImage', () => {
  vi.mock('node:fs');
  vi.mock('node:fs/promises');
  vi.mock('nanoid');

  const mockFetch = vi.fn();
  const mockWritable = new PassThrough();
  const createWriteStreamMock = vi.spyOn(FS, 'createWriteStream');
  const mkdirMock = vi.spyOn(FSp, 'mkdir');
  const statMock = vi.spyOn(FSp, 'stat');
  const nanoIdMock = vi.spyOn(NanoId, 'nanoid');

  global.fetch = mockFetch;

  it('should generate a latex image template', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node);

    expect(output).toBe('\\begin{center}\n\t\\includegraphics{images/image.jpg}\n\\end{center}');
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg');
  });

  it('should create a images directory if one does not exist', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;
    const imagesDir = resolve(process.cwd(), 'images');

    await convertImage(node);

    expect(statMock).toBeCalledWith(resolve(imagesDir, 'test.jpg'));
    expect(mkdirMock).toBeCalledWith(imagesDir);
  });

  it('should create a download the image using fetch and stream it to a file', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;

    await convertImage(node);

    expect(mockFetch).toBeCalledWith('http://test.com/image.jpg');
    expect(createWriteStreamMock).toBeCalledWith(resolve(process.cwd(), 'images', 'image.jpg'));
  });

  it('should support setting the parent directory for the images directory', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;

    await convertImage(node, { compilationDir: 'test-directory' });

    const imagesDir = resolve('test-directory', 'images');

    expect(mkdirMock).toBeCalledWith(imagesDir);
    expect(createWriteStreamMock).toBeCalledWith(resolve(imagesDir, 'image.jpg'));
  });

  it('should support autogenerated image filenames when saving the file', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });
    nanoIdMock.mockImplementationOnce(() => 'generatedid');

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;

    await convertImage(node, { autogenImageNames: true });

    const imagesDir = resolve(process.cwd(), 'images');

    expect(createWriteStreamMock).toBeCalledWith(resolve(imagesDir, 'generatedid.jpg'));
  });

  it('should use a jpg as the default file extension if it cant be infered from the link only when autogenerating file names', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });
    nanoIdMock.mockImplementationOnce(() => 'generatedid');

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image' }] } as ElementNode;

    await convertImage(node, { autogenImageNames: true });

    const imagesDir = resolve(process.cwd(), 'images');

    expect(createWriteStreamMock).toBeCalledWith(resolve(imagesDir, 'generatedid.jpg'));
  });

  it("should use the image's filename by default when saving the file", async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;
    const imagesDir = resolve(process.cwd(), 'images');

    await convertImage(node);

    expect(createWriteStreamMock).toBeCalledWith(resolve(imagesDir, 'image.jpg'));
  });

  it('should handle errors that occur while downloading the image', async () => {
    mockFetch.mockImplementationOnce(() => {
      throw new Error('Fetch Error');
    });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;

    const output = await convertImage(node);

    expect(typeof output).toBe('string');
  });

  it('should output logs if debug flag is passed and an error occurs during the file download', async () => {
    const fetchError = new Error('Fetch Error');

    mockFetch.mockImplementationOnce(() => {
      throw fetchError;
    });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));
    statMock.mockImplementationOnce(() => {
      throw new Error('File DNE');
    });

    const consoleMock = vi.spyOn(console, 'debug');

    const node = { attrs: [{ name: 'src', value: 'http://test.com/image.jpg' }] } as ElementNode;

    await convertImage(node, { debug: true });

    expect(consoleMock).toHaveBeenCalledWith(fetchError);
    expect(consoleMock).toHaveBeenCalledWith('URL: http://test.com/image.jpg');
  });

  it('should support setting the imageWidth', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node, {
      imageWidth: '2cm',
    });

    expect(output).toBe(
      '\\begin{center}\n\t\\includegraphics[width=2cm]{images/image.jpg}\n\\end{center}',
    );
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      width: '2cm',
    });
  });

  it('should support setting the imageHeight', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node, {
      imageHeight: '2cm',
    });

    expect(output).toBe(
      '\\begin{center}\n\t\\includegraphics[height=2cm]{images/image.jpg}\n\\end{center}',
    );
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      height: '2cm',
    });
  });

  it('should support setting the keepImageAspectRatio flag', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node, {
      imageHeight: '2cm',
      keepImageAspectRatio: true,
    });

    expect(output).toBe(
      '\\begin{center}\n\t\\includegraphics[height=2cm,keepaspectratio]{images/image.jpg}\n\\end{center}',
    );
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      keepImageAspectRatio: true,
    });
  });

  it('should ignore keepAspectRatio flag if width or height values are not passed', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node, {
      keepImageAspectRatio: true,
    });

    expect(output).toBe('\\begin{center}\n\t\\includegraphics{images/image.jpg}\n\\end{center}');
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      keepImageAspectRatio: true,
    });
  });

  it('should support setting the centerImages flag', async () => {
    mockFetch.mockResolvedValue({ body: Readable.from('hello') });
    createWriteStreamMock.mockReturnValueOnce(mockWritable as unknown as WriteStream);
    mkdirMock.mockImplementationOnce(() => Promise.resolve('done'));

    const imageTemplateSpy = vi.spyOn(Template, 'image');

    const node = { attrs: [{ name: 'src', value: 'test.jpg' }] } as ElementNode;
    const output = await convertImage(node, {
      centerImages: false,
    });

    expect(output).toBe('\\includegraphics{images/image.jpg}');
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      centerImages: false,
    });
  });

  // it('should convert wrapped img tag', async () => {
  //   const spy = jest.spyOn(ShortId, 'generate');
  //   spy.mockImplementation(() => 'image2');

  //   const html = `<p><img src="image.png"/></p>`;
  //   const tex = await convertText(html);

  //   expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.png}\n\\end{center}');

  //   spy.mockClear();
  // });
});