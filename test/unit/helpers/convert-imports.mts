import { expect, describe, test as it } from 'vitest';
import { convertPackageImports } from '../../../src/helpers/convert-imports.mjs';

describe('convertPackageImports', () => {
  it('should import amsmath when \\cfrac is present', () => {
    const pks = convertPackageImports('\\cfrac');

    expect(pks).toContain('amsmath');
  });

  it('should import graphicx when <img is present', () => {
    const pks = convertPackageImports('<img');

    expect(pks).toContain('graphicx');
  });

  it('should import amssymb when \\therefore is present', () => {
    const pks = convertPackageImports('\\therefore');

    expect(pks).toContain('amssymb');
  });

  it('should import amssymb when <s> is present', () => {
    const pks = convertPackageImports('<s>');

    expect(pks).toContain('ulem');
  });

  it('should import hyperref when </a> is present', () => {
    const pks = convertPackageImports('</a>');

    expect(pks).toContain('hyperref');
  });

  it('should import listings when </code> is present', () => {
    const pks = convertPackageImports('</code>');

    expect(pks).toContain('listings');
  });
});
