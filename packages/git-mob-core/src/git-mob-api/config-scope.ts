export function configScopeFlag(): string {
  const file = process.env.GITMOB_CONFIG_FILE;
  if (file && file.length > 0) {
    // callers should provide an absolute/expanded path
    return `--file ${file}`;
  }
  return '--global';
}
