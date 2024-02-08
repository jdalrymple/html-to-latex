import { PassThrough, Readable } from 'node:stream';
import * as FS from 'node:fs';
import type { WriteStream } from 'node:fs';
import * as FSp from 'node:fs/promises';
import { resolve } from 'node:path';
import * as NanoId from 'nanoid';
import { expect, describe, test as it, vi } from 'vitest';
import { convertPlainText, convertImage } from '../../src/convert.mts';
import type { ElementNode } from '../../src/convert.mjs';
import * as Template from '../../src/templates.mjs';

describe('convertPlainText', () => {
  it('should standardize line breaks by removing multiples return chatacters and tabs', () => {
    // New line character
    const output1 = convertPlainText('\n');

    expect(output1).toBe('\n\n');

    // Carrage character
    const output2 = convertPlainText('\r');

    expect(output2).toBe('\n\n');

    // Multiple return chatacters
    const output3 = convertPlainText('\r\n\r\n\n');

    expect(output3).toBe('\n\n');
  });

  it('should support skipping line break standardization', () => {
    // New line character
    const output1 = convertPlainText('\n', { ignoreBreaks: true });

    expect(output1).toBe('');

    // Carrage character
    const output2 = convertPlainText('\r', { ignoreBreaks: true });

    expect(output2).toBe('');

    // Multiple return chatacters
    const output3 = convertPlainText('\r\n\r\n\n', { ignoreBreaks: true });

    expect(output3).toBe('');
  });

  it('should remove `\t`', () => {
    const output = convertPlainText('Styled\tText');

    expect(output).toBe('StyledText');
  });

  it('should escape special characters', () => {
    const output = convertPlainText('% & # ~ < > |');

    expect(output).toBe('\\% \\& \\# \\textasciitilde{} < > \\textbar{}');
  });

  it('should not inlining math equations by default', () => {
    const output = convertPlainText(String.raw`\(3+2\)`);

    expect(output).toBe(String.raw`\(3+2\)`);
  });

  it('should support inlining math equations through the $ latex character', () => {
    const output = convertPlainText(String.raw`\(3+2\)`, { preferDollarInlineMath: true });

    expect(output).toBe('$3+2$');
  });
});

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
    const output = await convertImage(node, {
      imageHeight: '2cm',
      imageWidth: '2cm',
      keepImageAspectRatio: true,
      centerImages: true,
    });

    expect(typeof output).toBe('string');
    expect(imageTemplateSpy).toHaveBeenCalledWith('images/test.jpg', {
      width: '2cm',
      height: '2cm',
      keepRatio: true,
      center: true,
    });
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

  it('should houtput logs if debug flag is passed and an error occurs during the file download', async () => {
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
});
