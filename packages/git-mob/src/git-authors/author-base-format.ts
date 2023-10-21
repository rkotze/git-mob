import type { Author } from 'git-mob-core';

export function authorBaseFormat({ name, email }: Author): string {
  return `${name} <${email}>`;
}
