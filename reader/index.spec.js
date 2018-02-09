const test = require("ava");
const { readSetup } = require("./index");

test(".gitauthor file does not exist", async t => {
  let read = readSetup(() =>
    Promise.reject(new Error("enoent: no such file or directory, open"))
  );
  const error = await t.throws(read.gitAuthor());
  t.regex(error.message, /enoent: no such file or directory, open/i);
});

test("read contents from .gitauthor", async t => {
  let read = readSetup(() =>
    Promise.resolve("authors: jd: john doe; jdoe@findmypast.com")
  );
  const author = await read.gitAuthor();
  t.is(author, "authors: jd: john doe; jdoe@findmypast.com");
});
