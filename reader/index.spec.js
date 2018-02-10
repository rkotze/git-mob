const test = require("ava");
const { readSetup } = require("./index");

const validYaml = `
authors:
  jd: Jane Doe; jane
  fb: Frances Bar
email:
  domain: findmypast.com`;

test(".gitauthor file does not exist", async t => {
  const read = readSetup(() =>
    Promise.reject(new Error("enoent: no such file or directory, open"))
  );
  const error = await t.throws(read.gitAuthors());
  t.regex(error.message, /enoent: no such file or directory, open/i);
});

test("read contents from .gitauthor", async t => {
  const read = readSetup(() => Promise.resolve(validYaml));

  const author = await read.gitAuthors();
  console.log(author);
  t.deepEqual(author, {
    authors: {
      jd: "Jane Doe; jane",
      fb: "Frances Bar"
    },
    email: {
      domain: "findmypast.com"
    }
  });
});
