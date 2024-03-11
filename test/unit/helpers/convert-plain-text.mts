import { expect, test as it } from 'vitest';
import { convertPlainText } from '../../../src/helpers/convert-plain-text.mts';

it('should standardize line breaks by removing multiples return chatacters and tabs', () => {
  // New line character
  const output1 = convertPlainText('\n', { ignoreBreaks: false });

  expect(output1).toBe('\n\n');

  // Carrage character
  const output2 = convertPlainText('\r', { ignoreBreaks: false });

  expect(output2).toBe('\n\n');

  // Multiple return chatacters
  const output3 = convertPlainText('\r\n\r\n\n', { ignoreBreaks: false });

  expect(output3).toBe('\n\n');
});

it('should support skipping line break standardization by default', () => {
  // New line character
  const output1 = convertPlainText('\n');

  expect(output1).toBe('');

  // Carrage character
  const output2 = convertPlainText('\r');

  expect(output2).toBe('');

  // Multiple return chatacters
  const output3 = convertPlainText('\r\n\r\n\n');

  expect(output3).toBe('');
});

it('should remove tab characters', () => {
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

it('should prefer $ eq wrappers if configuration is given', async () => {
  const output = convertPlainText('Some content \\(x = 5\\Omega\\)', {
    preferDollarInlineMath: true,
  });

  expect(output).toBe('Some content $x = 5\\Omega$');
});

it('should handle eqs deep within text without tag wrapping', async () => {
  const input =
    'This is some plain text \\(A,{\\rm{ }}B\\) and \\(C\\) with random equations \\(a,{\\rm{ }}b\\) and \\(c\\) \\((a < b < c)\\)';
  const output = convertPlainText(input, { preferDollarInlineMath: true });

  expect(output).toBe(
    'This is some plain text $A,{\\rm{ }}B$ and $C$ with random equations $a,{\\rm{ }}b$ and $c$ $(a < b < c)$',
  );
});

// This was removed because it would be fail since we are allowing inline math in HTML.
it.skip('should escape `$`, `#`, `_`, `{`, `}`, `~`, `^`', async () => {
  const input = 'Styled$Text #Text _Text {Text} ~Text ^Text';
  const output = convertPlainText(input);

  expect(output).toBe('Styled\\$Text \\#Text \\_Text \\{Text\\} \\~Text \\^Text');
});

// Again, this was removed because we are allowing inline math in HTML.
it.skip('should escape `\\`', async () => {
  const input = 'Styled\\Text';
  const output = convertPlainText(input);

  expect(output).toBe('Styled\\textbackslash{}Text');
});
