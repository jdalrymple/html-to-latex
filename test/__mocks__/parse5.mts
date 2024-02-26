import { vi } from 'vitest';

type MockedParse5 = { parseFragement(this: void): void };

vi.mock('parse5', async (getModule) => {
  const original: MockedParse5 = await getModule();

  return {
    ...original,
    parseFragement: vi.fn().mockImplementation(original.parseFragement),
  };
});
