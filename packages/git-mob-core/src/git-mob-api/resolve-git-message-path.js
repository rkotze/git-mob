const path = require("path");
const os = require("os");

const { config } = require("../commands");
const { topLevelDirectory } = require("../git-rev-parse");

function setCommitTemplate() {
  if (!config.has("commit.template")) {
    config.set("--global commit.template", gitMessagePath());
  }
}

function resolveGitMessagePath(templatePath) {
  if (process.env.GITMOB_MESSAGE_PATH)
    return path.resolve(process.env.GITMOB_MESSAGE_PATH);

  if (templatePath) return path.resolve(topLevelDirectory(), templatePath);

  return path.relative(topLevelDirectory(), gitMessagePath());
}

function gitMessagePath() {
  return (
    process.env.GITMOB_MESSAGE_PATH || path.join(os.homedir(), ".gitmessage")
  );
}

module.exports = {
  resolveGitMessagePath,
  setCommitTemplate,
};
