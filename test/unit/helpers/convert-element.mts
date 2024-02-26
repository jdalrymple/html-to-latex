import { parseFragment } from 'parse5';
import { expect, describe, test as it, vi } from 'vitest';
import { convertElement } from '../../../src/helpers/convert-element.mts';
import * as Template from '../../../src/templates.mts';

describe('convertElement', () => {
  it('should properly convert html tags', async () => {
    const node = parseFragment('<html><body>Test</body></html>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Test');
  });

  it('should convert a div', async () => {
    const node = parseFragment('<div></div>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('');
  });

  it('should convert a nested div', async () => {
    const node = parseFragment('<div><div>Hello World!</div></div>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Hello World!');
  });

  it('should properly convert section tags', async () => {
    const node = parseFragment('<body><section>Test</section></body>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Test');
  });

  it('should properly convert aside tags', async () => {
    const node = parseFragment('<body><aside>Test</aside></body>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Test');
  });

  it('should properly convert aside tags', async () => {
    const node = parseFragment('<body><footer>Test</footer></body>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Test');
  });

  it('should properly convert main tags', async () => {
    const node = parseFragment('<body><main>Test</main></body>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Test');
  });

  it('should convert an unknown tag', async () => {
    const node = parseFragment('<unknown>Text</unknown>');
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('Text');
  });

  it('should convert an unknown tag inside text', async () => {
    const node = parseFragment(
      '<p>I was born on <time datetime="1000-12-31 12:00">31 Dec</time></p>',
    );
    const tex = await convertElement(node.childNodes[0]);

    expect(tex).toBe('I was born on 31 Dec');
  });

  it('should convert horizontal rule', async () => {
    const dividerSpy = vi.spyOn(Template, 'divider');
    const node = parseFragment('<hr>');

    await convertElement(node.childNodes[0]);

    expect(dividerSpy).toHaveBeenCalled();
  });

  it('should convert code tags', async () => {
    const templateSpy = vi.spyOn(Template, 'sourceCode');
    const node = parseFragment(`<code>console.log('Hello World!');</code>`);

    await convertElement(node.childNodes[0]);

    expect(templateSpy).toHaveBeenCalledWith(`console.log('Hello World!')`);
  });
});
