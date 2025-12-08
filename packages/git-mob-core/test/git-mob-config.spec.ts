import test from 'ava';
import sinon from 'sinon';
import * as execModule from '../src/git-mob-api/exec-command.js';
import * as gitMobConfig from '../src/git-mob-api/git-mob-config.js';

test.afterEach(() => {
  delete process.env.GITMOB_CONFIG_FILE;
  sinon.restore();
});

test.serial('addCoAuthor uses --global when GITMOB_CONFIG_FILE not set', async t => {
  const stub = sinon.stub(execModule, 'execCommand').resolves();
  await gitMobConfig.addCoAuthor('Jane Doe <jane@example.com>');
  t.true(
    stub.calledWith(
      'git config --add --global git-mob.co-author "Jane Doe <jane@example.com>"'
    )
  );
});

test.serial('addCoAuthor uses --file when GITMOB_CONFIG_FILE is set', async t => {
  process.env.GITMOB_CONFIG_FILE = '/tmp/.gitconfig.local';
  const stub = sinon.stub(execModule, 'execCommand').resolves();
  await gitMobConfig.addCoAuthor('Bob Doe <bob@example.com>');
  t.true(
    stub.calledWith(
      'git config --add --file /tmp/.gitconfig.local git-mob.co-author "Bob Doe <bob@example.com>"'
    )
  );
});

test.serial('getSetCoAuthors uses --global when GITMOB_CONFIG_FILE not set', async t => {
  const stub = sinon.stub(execModule, 'getAllConfig').resolves([]);
  await gitMobConfig.getSetCoAuthors();
  t.true(stub.calledWith('--global git-mob.co-author'));
});

test.serial('getSetCoAuthors uses --file when GITMOB_CONFIG_FILE is set', async t => {
  process.env.GITMOB_CONFIG_FILE = '/tmp/customgitconfig';
  const stub = sinon.stub(execModule, 'getAllConfig').resolves([]);
  await gitMobConfig.getSetCoAuthors();
  t.true(stub.calledWith('--file /tmp/customgitconfig git-mob.co-author'));
});
