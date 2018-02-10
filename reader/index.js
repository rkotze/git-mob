const fs = require("fs");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const yaml = require("js-yaml");

function readSetup(readFilePromise) {
  const readPromise = readFilePromise || promisify(fs.readFile);
  async function readFile(path) {
    try {
      return await readPromise(path, "utf8");
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  return {
    gitAuthors: async () => {
      const authorYaml = await readFile(path.join(os.homedir(), ".gitauthor"));
      return yaml.load(authorYaml);
    }
  };
}

module.exports = { readSetup };
