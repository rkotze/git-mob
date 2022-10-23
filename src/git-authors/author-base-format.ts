export function authorBaseFormat({ name, email }: Author): string {
  return `${name} <${email}>`;
}
