const fs = require("fs");
const path = require("path");
const { logIssue } = require("../errors/log-issue");
const { GitExt } = require("../vscode-git-extension/git-ext");

exports.watchForCommit = function watchForCommit(cb) {
  const gitExt = new GitExt();
  const gitCommit = path.join(gitExt.rootPath, ".git");

  try {
    return fs.watch(gitCommit, function (evt, filename) {
      if (filename && filename === "COMMIT_EDITMSG") {
        if (debounceFsWatch()) return;
        cb(evt);
      }
    });
  } catch (err) {
    logIssue("Watch for commit failed!: " + err.message);
  }
};

let fsWait = false;
function debounceFsWatch() {
  if (fsWait) return true;
  fsWait = setTimeout(() => {
    fsWait = false;
  }, 1000); // windows is a bit slower
}
