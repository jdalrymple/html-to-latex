import { parseFragment } from 'parse5';
import { expect, describe, test as it, vi } from 'vitest';
import * as Template from '../../../src/templates.mts';
import { convertHeading } from '../../../src/helpers/convert-heading.mts';
import * as convertInlineUtils from '../../../src/helpers/convert-inline-element.mts';
import { ElementNode } from '../../../src/types.mts';

describe('convertHeading', () => {
  it('should convert h1 tags to sections', () => {
    const convertInlineElementSpy = vi.spyOn(convertInlineUtils, 'convertInlineElement');
    const templateSpy = vi.spyOn(Template, 'section');

    const node = parseFragment('<h1>Text</h1>');

    convertHeading(node.childNodes[0] as ElementNode);

    expect(convertInlineElementSpy).toBeCalledWith(node.childNodes[0], {});
    expect(templateSpy).toBeCalledWith('Text');
  });

  it('should convert h2 tags to subsections', () => {
    const convertInlineElementSpy = vi.spyOn(convertInlineUtils, 'convertInlineElement');
    const templateSpy = vi.spyOn(Template, 'subsection');

    const node = parseFragment('<h2>Text</h2>');

    convertHeading(node.childNodes[0] as ElementNode);

    expect(convertInlineElementSpy).toBeCalledWith(node.childNodes[0], {});
    expect(templateSpy).toBeCalledWith('Text');
  });

  it('should convert h3 tags to subsubsections', () => {
    const convertInlineElementSpy = vi.spyOn(convertInlineUtils, 'convertInlineElement');
    const templateSpy = vi.spyOn(Template, 'subsubsection');

    const node = parseFragment('<h3>Text</h3>');

    convertHeading(node.childNodes[0] as ElementNode);

    expect(convertInlineElementSpy).toBeCalledWith(node.childNodes[0], {});
    expect(templateSpy).toBeCalledWith('Text');
  });
});
