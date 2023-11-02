import { getConfig, updateConfig } from './config-manager.js';

it('change the processCwd config property', () => {
  expect(getConfig('processCwd')).toBeUndefined();
  const dir = 'C:/path/dir';
  updateConfig('processCwd', dir);
  expect(getConfig('processCwd')).toBe(dir);
});

it('throw error for invalid config property', () => {
  const dir = 'C:/path/dir';

  expect(() => {
    updateConfig('cwd', dir);
  }).toThrowError(
    expect.objectContaining({
      message: expect.stringMatching(
        'Invalid Git Mob Core config property "cwd"'
      ) as string,
    })
  );
});
