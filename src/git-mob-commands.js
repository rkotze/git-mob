import { config } from '../src/git-commands';

function getCoAuthors() {
  return config.getAll('--global git-mob.co-author');
}

function isCoAuthorSet() {
  return config.has('--global git-mob.co-author');
}

function addCoAuthor(coAuthor) {
  config.add('--global git-mob.co-author', coAuthor);
}

function resetMob() {
  config.removeSection('--global git-mob');
}

function useLocalTemplate() {
  const localTemplate = config.get('--local git-mob-config.use-local-template');
  return localTemplate && localTemplate === 'true';
}

function getGitAuthor() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  return { name, email };
}

function setGitAuthor(name, email) {
  config.set('user.name', name);
  config.set('user.email', email);
}

const mobConfig = {
  useLocalTemplate
};

export {
  getCoAuthors,
  getGitAuthor,
  isCoAuthorSet,
  addCoAuthor,
  resetMob,
  setGitAuthor,
  mobConfig
};
