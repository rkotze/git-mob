const config: Record<string, string | undefined> = {
  processCwd: undefined,
};

export function getConfig(prop: string) {
  return config[prop];
}

export function updateConfig(prop: string, value: string) {
  if (prop in config) {
    config[prop] = value;
  } else {
    throw new Error(`Invalid Git Mob Core config property "${prop}"`);
  }
}
