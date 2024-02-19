import { expect, describe, test as it, vi } from 'vitest';
import { convertPlainText } from '../../../src/helpers/convert-plain-text.mts';

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
});
