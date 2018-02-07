const fs = require('fs');
const exec = require('child_process').exec;

function execute(command, callback) {
  exec(command, (error, stdout) => {
    callback(stdout);
  });
}
// Read from stdout
execute('git config commit.template', stdout => {
  console.log('commit.template', stdout);
});

// Reading files
fs.readFile('.git/.gitmessage', 'utf8', (err, data) => {
  if (err) {
    throw err;
  }
  console.log('Read git file -----', data);
  console.log('----- end');
});
