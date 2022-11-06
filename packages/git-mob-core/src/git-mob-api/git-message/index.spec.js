const os = require("os");
const { Author } = require("../author");
const { gitMessage } = require("./index");

test("Append co-authors to .gitmessage append file mock", () => {
  const appendMock = jest.fn();
  const message = gitMessage(".git/.gitmessage", appendMock);
  message.writeCoAuthors([
    new Author("jd", "Jane Doe", "jane@findmypast.com"),
    new Author("fb", "Frances Bar", "frances-bar@findmypast.com"),
  ]);

  expect(appendMock).toBeCalledTimes(1);
  expect(appendMock).toBeCalledWith(
    expect.stringContaining(".gitmessage"),
    [
      os.EOL,
      os.EOL,
      "Co-authored-by: Jane Doe <jane@findmypast.com>",
      os.EOL,
      "Co-authored-by: Frances Bar <frances-bar@findmypast.com>",
    ].join("")
  );
});
