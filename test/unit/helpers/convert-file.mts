import { expect, test as it, vi, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { readFile, rm, mkdtemp, copyFile } from 'node:fs/promises';
import { convertFile } from '../../../src/helpers/convert-file.mjs';

const testTemporaryDirectory = await mkdtemp('test-artifacts');

afterAll(async () => {
  await rm(testTemporaryDirectory, { recursive: true, force: true });
});

it('should convert text with a mixture of nested tags', async () => {
  const outputPath = resolve(testTemporaryDirectory, 'nested.tex');

  await convertFile(resolve(__dirname, '../../assets/samples/nested.html'), {
    includeDocumentWrapper: false,
    outputFilePath: outputPath,
  });

  const tex = await readFile(outputPath, 'utf-8');
  const text = [
    "\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}",
    '',
    '\\subsection*{\\textbf{Concept of Forces}}',
    '',
    'Some types of forces may be (i) Contact forces, (ii) Non-contact forces \\textbf{Contact forces} involve physical contact between two objects.',
  ];

  expect(tex).toBe(text.join('\n'));
});

it('should output to the source file directory by default', async () => {
  const outputPath = resolve(testTemporaryDirectory, 'default-path.tex');
  const originalSourcePath = resolve(__dirname, '../../assets/samples/nested.html');
  const newSourcePath = resolve(testTemporaryDirectory, 'default-path.html');

  await copyFile(originalSourcePath, newSourcePath);

  await convertFile(newSourcePath, {
    includeDocumentWrapper: false,
  });

  const tex = await readFile(outputPath, 'utf-8');
  const text = [
    "\\section*{\\centering{\\underline{\\textbf{Newton's Laws of Motion}}}}",
    '',
    '\\subsection*{\\textbf{Concept of Forces}}',
    '',
    'Some types of forces may be (i) Contact forces, (ii) Non-contact forces \\textbf{Contact forces} involve physical contact between two objects.',
  ];

  expect(tex).toBe(text.join('\n'));
});
