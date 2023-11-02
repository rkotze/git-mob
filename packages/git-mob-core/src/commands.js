import { silentRun } from './silent-run.js';
import { execCommand } from './git-mob-api/exec-command.js';

function handleResponse(query) {
  try {
    const response = silentRun(query);
    if (response.status !== 0) {
      return `GitMob handleResponse: "${query}" ${response.stderr.trim()}`;
    }

    return response.stdout.trim();
  } catch (error) {
    return `GitMob catch: "${query}" ${error.message}`;
  }
}

function getAll(key) {
  return handleResponse(`git config --get-all ${key}`);
}

function get(key) {
  return handleResponse(`git config --get ${key}`);
}

function has(key) {
  return silentRun(`git config ${key}`).status === 0;
}

function add(key, value) {
  return silentRun(`git config --add ${key} "${value}"`);
}

function usingLocalTemplate() {
  return has('--local commit.template');
}

function usingGlobalTemplate() {
  return has('--global commit.template');
}

function getGlobalTemplate() {
  return get('--global commit.template');
}

// Sets the option, overwriting the existing value if one exists.
function set(key, value) {
  const { status } = silentRun(`git config ${key} "${value}"`);
  if (status !== 0) {
    const message = `Option ${key} has multiple values. Cannot overwrite multiple values for option ${key} with a single value.`;
    console.log(`GitMob set: ${message}`);
  }
}

function gitAddCoAuthor(coAuthor) {
  return add('--global git-mob.co-author', coAuthor);
}

function removeGitMobSection() {
  return silentRun(`git config --global --remove-section git-mob`);
}

export async function getRepoAuthors() {
  return execCommand('git shortlog -sen HEAD');
}

export const config = {
  getAll,
  get,
  has,
  set,
};

export const mob = {
  removeGitMobSection,
  gitAddCoAuthor,
  usingLocalTemplate,
  usingGlobalTemplate,
  getGlobalTemplate,
};
