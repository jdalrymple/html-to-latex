import { expect, test as it } from 'vitest';
import { convertParagraph } from '../../../src/helpers/convert-paragraph.mts';
import { parseFragment } from 'parse5';
import { ElementNode } from '../../../src/types.mts';

it('should convert eq wrappers \\[ wrapper instead of \\( when p tag only includes an equation', async () => {
  const node = parseFragment('<p>\\(x = 5\\Omega\\)</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode);

  expect(output).toBe('\\[x = 5\\Omega\\]');
});

it('should use the \\[ wrapper instead of $ when p tag only includes an equation', async () => {
  const node = parseFragment('<p>$x = 5\\Omega$</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode);

  expect(output).toBe('\\[x = 5\\Omega\\]');
});

it('should use the \\[ wrapper instead of \\( if skipWrappingEquations is true when p tag only includes an equation', async () => {
  const node = parseFragment('<p>\\(x = 5\\Omega\\)</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode, {
    skipWrappingEquations: true,
  });

  expect(output).toBe('\\(x = 5\\Omega\\)');
});

it('should not use the \\[ wrapper instead of $ if skipWrappingEquations is true when p tag only includes an equation', async () => {
  const node = parseFragment('<p>$x = 5\\Omega$</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode, {
    skipWrappingEquations: true,
  });

  expect(output).toBe('$x = 5\\Omega$');
});

it('should not modify equation wrappers in p tags with an equation and other content', async () => {
  const node = parseFragment('<p>Some content $x = 5\\Omega$</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode);

  expect(output).toBe('Some content $x = 5\\Omega$');
});

it('should not use the \\[ wrapper instead of $ if there is an unmatched $ in the equation when p tag only includes an equation', async () => {
  const node = parseFragment('<p>$x = 5$$</p>');
  const output = convertParagraph(node.childNodes[0] as ElementNode);

  expect(output).toBe('$x = 5$$');
});
