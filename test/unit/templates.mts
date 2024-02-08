import { expect, describe, test as it } from 'vitest';
import { latexSpecialCharacter } from '../../src/templates.mts';

describe('latexSpecialCharacter', () => {
  it('should escape special character: "\\"', () => {
    const input = '\\';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\textbackslash{}');
  });

  it('should escape special character: "{"', () => {
    const input = '{';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\{');
  });

  it('should escape special character: "}"', () => {
    const input = '}';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\}');
  });

  it('should escape special character: "%"', () => {
    const input = '%';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\%');
  });

  it('should escape special character: "$"', () => {
    const input = '$';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\$');
  });

  it('should escape special character: "&"', () => {
    const input = '&';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\&');
  });

  it('should escape special character: "#"', () => {
    const input = '#';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\#');
  });

  it('should escape special character: "^"', () => {
    const input = '^';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\^{}');
  });

  it('should escape special character: "_"', () => {
    const input = '_';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\_');
  });

  it('should escape special character: "~"', () => {
    const input = '~';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\textasciitilde{}');
  });

  it('should escape special character: "|"', () => {
    const input = '|';
    const output = latexSpecialCharacter(input);

    expect(output).toStrictEqual('\\textbar{}');
  });
});
