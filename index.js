const fs = require("fs");
var exec = require("child_process").exec;
function execute(command, callback) {
  exec(command, function(error, stdout, stderr) {
    callback(stdout);
  });
}
// read from stdout
execute("git config commit.template", stdout => {
  console.log("commit.template", stdout);
});

// reading files
fs.readFile(".git/.gitmessage", "utf8", (err, data) => {
  if (err) throw err;
  console.log("Read git file -----", data);
  console.log("----- end");
});
