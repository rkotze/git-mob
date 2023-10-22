import type { Author } from 'git-mob-core';
import { fetchGitHubAuthors, saveNewCoAuthors } from 'git-mob-core';
import { mobConfig } from '../git-mob-commands';

async function saveMissingAuthors(
  initials: string[],
  coAuthorList: Author[],
  getAuthors = fetchGitHubAuthors,
  saveAuthors = saveNewCoAuthors
): Promise<string[]> {
  if (!mobConfig.fetchFromGitHub()) {
    return [];
  }

  const missing = findMissingAuthors(initials, coAuthorList);
  if (missing.length > 0) {
    const fetchedAuthors: Author[] = await getAuthors(missing, 'git-mob-cli');
    await saveAuthors(fetchedAuthors);
    return fetchedAuthors.map(author => author.toString());
  }

  return [];
}

function findMissingAuthors(
  initialList: string[],
  coAuthorList: Author[]
): string[] {
  return initialList.filter(initials => !containsAuthor(initials, coAuthorList));
}

function containsAuthor(initials: string, coauthors: Author[]): boolean {
  return coauthors.some(author => author.key === initials);
}

export { findMissingAuthors, saveMissingAuthors };
