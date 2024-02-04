import ShortId from 'shortid';
import { convertFile, convertText, exportFile } from '../../src/convert.mjs';

describe('Converting img tags', () => {
  it('should convert simple img tag', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, { autoGenImageNames: false });

    expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}');
  });

  it('should convert wrapped img tag', async () => {
    const spy = jest.spyOn(ShortId, 'generate');
    spy.mockImplementation(() => 'image2');

    const html = `<p><img src="image.png"/></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.png}\n\\end{center}');

    spy.mockClear();
  });

  it('should default to a jpg extension when converting img tag with a image url without a extension', async () => {
    const spy = jest.spyOn(ShortId, 'generate');
    spy.mockImplementation(() => 'image2');

    const html = `<p><img src="image"/></p>`;
    const tex = await convertText(html);

    expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image2.jpg}\n\\end{center}');

    spy.mockClear();
  });

  it('should add width restrictions when given', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, { autoGenImageNames: false, imageWidth: '2cm' });

    expect(tex).toBe(
      '\\begin{center}\n\t\\includegraphics[width=2cm]{images/image.png}\n\\end{center}',
    );
  });

  it('should add height restrictions when given', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, { autoGenImageNames: false, imageHeight: '2cm' });

    expect(tex).toBe(
      '\\begin{center}\n\t\\includegraphics[height=2cm]{images/image.png}\n\\end{center}',
    );
  });

  it('should keep aspect ratio when given and width or height are restricted', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, {
      autoGenImageNames: false,
      imageHeight: '2cm',
      keepImageAspectRatio: true,
    });

    expect(tex).toBe(
      '\\begin{center}\n\t\\includegraphics[height=2cm,keepaspectratio]{images/image.png}\n\\end{center}',
    );
  });

  it('should ignore aspect ratio when given if width or height are not restricted', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, { autoGenImageNames: false, keepImageAspectRatio: true });

    expect(tex).toBe('\\begin{center}\n\t\\includegraphics{images/image.png}\n\\end{center}');
  });

  it('should not center the image', async () => {
    const html = `<img src="image.png"/>`;
    const tex = await convertText(html, { autoGenImageNames: false, centerImages: false });

    expect(tex).toBe('\\includegraphics{images/image.png}');
  });
});

describe('Converting with debug flag', () => {
  it('should display errors when converting img tag with an inaccessible source url with the debug flag', async () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation();
    const html = `<img src="image.png"/>`;

    await convertText(html, { autoGenImageNames: false, debug: true });

    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  it('should not display errors when converting img tag with an inaccessible source url without the debug flag', async () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation();
    const html = `<img src="image.png"/>`;

    await convertText(html, { autoGenImageNames: false });

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });
});
