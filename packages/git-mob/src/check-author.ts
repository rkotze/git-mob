import os from 'node:os';
import type { Author } from 'git-mob-core';

function configWarning({ name, email }: Author) {
  let result = '';
  if (name === '' || email === '') {
    result = 'Warning: Missing information for the primary author. Set with:';
  }

  if (name === '') {
    result += os.EOL + '$ git config --global user.name "Jane Doe"';
  }

  if (email === '') {
    result += os.EOL + '$ git config --global user.email "jane@example.com"';
  }

  return result;
}

export { configWarning };
