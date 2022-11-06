const fs = require("fs");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const { Author } = require("../author");

function gitAuthors(readFilePromise, writeFilePromise, overwriteFilePromise) {
  async function readFile(path) {
    const readPromise = readFilePromise || promisify(fs.readFile);
    try {
      return await readPromise(path, "utf8");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function writeToFile(path, content) {
    const writeToPromise = writeFilePromise || promisify(fs.appendFile);
    try {
      return await writeToPromise(path, content, "utf8");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function overwriteFile(path, content) {
    const overwritePromise = overwriteFilePromise || promisify(fs.writeFile);
    try {
      return await overwritePromise(path, content, "utf8");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function author({ name, email }) {
    return `${name} <${email}>`;
  }

  return {
    read: async () => {
      const authorJsonString = await readFile(pathToCoAuthors());
      try {
        return JSON.parse(authorJsonString);
      } catch (error) {
        throw new Error("Invalid JSON " + error.message);
      }
    },

    write: async (authorJson) => {
      try {
        return writeToFile(
          pathToCoAuthors(),
          JSON.stringify(authorJson, null, 2)
        );
      } catch (error) {
        throw new Error("Invalid JSON " + error.message);
      }
    },

    overwrite: async (authorJson) => {
      try {
        return overwriteFile(
          pathToCoAuthors(),
          JSON.stringify(authorJson, null, 2)
        );
      } catch (error) {
        throw new Error("Invalid JSON " + error.message);
      }
    },

    fileExists: () => {
      return fs.existsSync(pathToCoAuthors());
    },

    coAuthors(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      return authorInitials.map((initials) => {
        missingAuthorError(initials, coauthors);
        return author(coauthors[initials]);
      });
    },

    author(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      missingAuthorError(authorInitials, coauthors);
      return coauthors[authorInitials];
    },

    coAuthorsInitials(authorJson, currentCoAuthors) {
      const { coauthors } = authorJson;
      return Object.keys(coauthors).reduce(
        (currentCoAuthorsInitials, initials) => {
          if (currentCoAuthors.includes(author(coauthors[initials]))) {
            currentCoAuthorsInitials.push(initials);
          }

          return currentCoAuthorsInitials;
        },
        []
      );
    },

    toList(authors) {
      const entries = Object.entries(authors.coauthors);
      return entries.map(
        ([key, { name, email }]) => new Author(key, name, email)
      );
    },
  };
}

function missingAuthorError(initials, coauthors) {
  if (!(initials in coauthors)) {
    throw new Error(`Author with initials "${initials}" not found!`);
  }
}

function pathToCoAuthors() {
  return (
    process.env.GITMOB_COAUTHORS_PATH ||
    path.join(os.homedir(), ".git-coauthors")
  );
}

module.exports = { gitAuthors, pathToCoAuthors };
