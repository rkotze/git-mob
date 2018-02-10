import test from "ava";
import { exec } from "shelljs";

test("mob help", async t => {
  const { stdout } = await exec("git mob -h", { silent: true });

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});

test("mob version", async t => {
  const { stdout } = await exec("git mob -v", { silent: true });

  t.regex(stdout, /\d.\d.\d/);
});

test("missing author when setting co-author mob rk", async t => {
  const { stdout } = await exec("git mob rk", { silent: true });

  t.regex(stdout, /error/i);
  t.regex(stdout, /rk initials not found/i);
  t.regex(stdout, /add to .\/\.git-authors file/i);
});
