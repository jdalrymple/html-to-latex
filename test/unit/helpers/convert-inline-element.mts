import { parseFragment } from 'parse5';
import { expect, test as it, vi } from 'vitest';
import * as Template from '../../../src/templates.mts';
import { convertInlineElement } from '../../../src/helpers/convert-inline-element.mts';
import * as convertPlainTextUtils from '../../../src/helpers/convert-plain-text.mts';

it('should handle pure text by calling the convertPlainText function', () => {
  const convertPlainTextSpy = vi.spyOn(convertPlainTextUtils, 'convertPlainText');

  const node = parseFragment('<span>test</span>');
  const converted = convertInlineElement(node.childNodes[0]);

  // Roundabout way to test this since spying on a direct function isnt doable nicely
  expect(convertPlainTextSpy).toHaveBeenCalledWith('test', {
    ignoreBreaks: true,
  });
  expect(converted).toBe('test');
});

it('should handle bold tags by calling the bold template', () => {
  const templateSpy = vi.spyOn(Template, 'bold');

  const nodes = [
    parseFragment('<span><b>test</b></span>'),
    parseFragment('<span><strong>test</strong></span>'),
  ];

  nodes.forEach((n) => {
    convertInlineElement(n.childNodes[0]);
    expect(templateSpy).toHaveBeenCalledWith('test');
  });
});

it('should handle italic tags by calling the italic template', () => {
  const templateSpy = vi.spyOn(Template, 'italic');

  const nodes = [
    parseFragment('<span><i>test</i></span>'),
    parseFragment('<span><em>test</em></span>'),
  ];

  nodes.forEach((n) => {
    convertInlineElement(n.childNodes[0]);
    expect(templateSpy).toHaveBeenCalledWith('test');
  });
});

it('should handle underline tags by calling the underline template', () => {
  const templateSpy = vi.spyOn(Template, 'underline');

  const node = parseFragment('<span><u>test</u></span>');

  convertInlineElement(node.childNodes[0]);

  expect(templateSpy).toHaveBeenCalledWith('test');
});

it('should handle strikethrough tags by calling the strikethrough template', () => {
  const templateSpy = vi.spyOn(Template, 'strikethrough');

  const node = parseFragment('<span><s>test</s></span>');

  convertInlineElement(node.childNodes[0]);

  expect(templateSpy).toHaveBeenCalledWith('test');
});

it('should handle subscript tags by calling the subscript template', () => {
  const templateSpy = vi.spyOn(Template, 'subscript');

  const node = parseFragment('<span><sub>test</sub></span>');

  convertInlineElement(node.childNodes[0]);

  expect(templateSpy).toHaveBeenCalledWith('test');
});

it('should handle superscript tags by calling the superscript template', () => {
  const templateSpy = vi.spyOn(Template, 'superscript');

  const node = parseFragment('<span><sup>test</sup></span>');

  convertInlineElement(node.childNodes[0]);

  expect(templateSpy).toHaveBeenCalledWith('test');
});

it('should handle anchor tags by calling the hyperlink template', () => {
  const templateSpy = vi.spyOn(Template, 'hyperlink');

  const node = parseFragment('<span><a href="url">test</a></span>');

  convertInlineElement(node.childNodes[0]);

  expect(templateSpy).toHaveBeenCalledWith('test', 'url');
});

it('should handle break tags by inserting double new lines', () => {
  const node = parseFragment('<span><br>test</span>');

  const converted = convertInlineElement(node.childNodes[0], { ignoreBreaks: false });

  expect(converted).toBe('\n\ntest');
});

it('should skip break tags if the ignoreBreaks option is passed', () => {
  const node = parseFragment('<span><br>test</span>');

  const converted = convertInlineElement(node.childNodes[0], { ignoreBreaks: true });

  expect(converted).toBe(' test');
});

it('should skip break tags by default', () => {
  const node = parseFragment('<span><br>test</span>');

  const converted = convertInlineElement(node.childNodes[0]);

  expect(converted).toBe(' test');
});

it('should return an empty string if no tags are matched', () => {
  const node = parseFragment('<span><unknown></unknown></span>');

  const converted = convertInlineElement(node.childNodes[0]);

  expect(converted).toBe('');
});

it('should handle multiple nested tags', () => {
  const node = parseFragment('<span><b>One</b><span><i>Two</i></span></span>');

  const converted = convertInlineElement(node.childNodes[0]);

  expect(converted).toBe('\\textbf{One}\\textit{Two}');
});
