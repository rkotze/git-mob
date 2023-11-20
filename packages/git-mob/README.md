# Git Mob - Co-author commits

![npm downloads](https://img.shields.io/npm/dm/git-mob.svg) [![npm version](https://badge.fury.io/js/git-mob.svg)](https://www.npmjs.com/package/git-mob)

> A command-line tool for social coding

_Add co-authors to commits_ when you collaborate on code. Use when pairing with a buddy or mobbing with your team.

[✨ Git Mob VS Code extension](https://github.com/rkotze/git-mob-vs-code)

![gif showing example usage of git-mob](https://user-images.githubusercontent.com/497458/38682926-2e0cc99c-3e64-11e8-9f71-6336e111005b.gif)

- [Git Mob - Co-author commits](#git-mob---co-author-commits)
  - [Install](#install)
  - [Workflow / Usage](#workflow--usage)
    - [Add co-author from GitHub](#add-co-author-from-github)
  - [Custom setup](#custom-setup)
    - [Using `git commit -m` setup](#using-git-commit--m-setup)
      - [Using pre-commit to install](#using-pre-commit-to-install)
    - [Revert back to default setup](#revert-back-to-default-setup)
  - [Git Mob config](#git-mob-config)
    - [Use local commit template](#use-local-commit-template)
    - [Enable GitHub author fetch](#enable-github-author-fetch)
  - [More commands](#more-commands)
    - [List all co-authors](#list-all-co-authors)
    - [Overwrite the main author](#overwrite-the-main-author)
    - [Add co-author](#add-co-author)
    - [Delete co-author](#delete-co-author)
    - [Edit co-author](#edit-co-author)
    - [Suggest co-authors](#suggest-co-authors)
    - [Help](#help)
    - [Add initials of current mob to your prompt](#add-initials-of-current-mob-to-your-prompt)
      - [Bash](#bash)
      - [Fish](#fish)
  - [More info](#more-info)

## Install

git-mob is a CLI tool, so you'll need to install the package globally.

```
npm i -g git-mob
```

By default git-mob will use the **global** config `.gitmessage` template to append co-authors.

## Workflow / Usage

With git-mob, the primary author will always be the primary user of the computer.
Set your author info in git if you haven't done so before.

```
$ git config --global user.name "Jane Doe"
$ git config --global user.email "jane@example.com"
```

To keep track of co-authors git-mob uses a JSON file called `.git-coauthors`, and will try to find it in the following directories:

1. If `GITMOB_COAUTHORS_PATH` environment variable is set this will override any other settings.
2. If the current Git repository has a `.git-coauthors` file in the root directory.
3. The default is the users home directory at `~/.git-coauthors`.

Here's a template of its structure:

```json
{
  "coauthors": {
    "<initials>": {
      "name": "<name>",
      "email": "<email>"
    }
  }
}
```

Start by adding a few co-authors that you work with. Also see [add co-author](#add-co-author) command.

```bash
$ cat <<-EOF > ~/.git-coauthors
{
  "coauthors": {
    "ad": {
      "name": "Amy Doe",
      "email": "amy@findmypast.com"
    },
    "bd": {
      "name": "Bob Doe",
      "email": "bob@findmypast.com"
    }
  }
}
EOF
```

You're ready to create your mob. Tell git-mob you're pairing with Amy by using her initials. `git mob ad`

```
$ git mob ad
Jane Doe <jane@example.com>
Amy Doe <amy@example.com>
```

Commit like you normally would.
You should see `Co-authored-by: Amy Doe <amy@example.com>` appear at the end of the commit message.

Let's add Bob to the group to create a three-person mob.

```
$ git mob ad bd
Jane Doe <jane@example.com>
Amy Doe <amy@example.com>
Bob Doe <bob@example.com>
```

Once you're done mobbing, switch back to developing solo.<sup>\*</sup>

```
$ git solo
Jane Doe <jane@example.com>
```

Selected co-authors are **stored globally** meaning when switching between projects your co-authors stay the same\*.

**\*Note**: If you've set a **local** commit template in your config then that template will be updated. However, **not** when you switch projects and you will see a warning. You can run `git mob` to update the commit template. [Read more here](https://github.com/rkotze/git-mob/discussions/81)

### Add co-author from GitHub

Provide the GitHub username to generate their co-author details. The _anonymous_ GitHub email is used. You need to enable it [see config](#enable-github-author-fetch).

```
$ git mob rkotze
Jane Doe <jane@example.com>
Richard Kotze <10422117+rkotze@users.noreply.github.com>
```

## Custom setup

### Using `git commit -m` setup

How to append co-authors to the message when using message flag - `git commit -m "commit message"`?

1. Add `prepare-commit-msg` hook file in `.git/hooks` dir. See [hook-examples](https://github.com/rkotze/git-mob/tree/master/hook-examples)
2. The **hook** will need to be executable `chmod +x prepare-commit-msg`

`prepare-commit-msg` will need a script to read the co-authors, which can be done via `git mob-print`. See [hook-examples](https://github.com/rkotze/git-mob/tree/master/hook-examples) folder for working scripts.

The command `git mob-print` will output to `stdout` the formatted co-authors.

**Note:** > `v1.1.0` `git mob --installTemplate` and `git mob --uninstallTemplate` has been removed.

#### Using pre-commit to install

You can install the git hook using `[pre-commit](https://pre-commit.com/)`. Add the following to your `pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/rkotze/git-mob
    rev: { tag-version }
    hooks:
      - id: add-coauthors
        stages: ['prepare-commit-msg']
```

And install with: `pre-commit install --hook-type prepare-commit-msg`.

Removing the above snippet and running `git commit` will uninstall the pre-commit hook

### Revert back to default setup

1. Remove relevant scripts `prepare-commit-msg` file

## Git Mob config

Git Mob config is a section in the Git config.

### Use local commit template

If you are using a local commit template and want to remove the warning message then set this option to `true`. Only reads from the local git config.

`type: Boolean`, `scope: local`, `version: 2.2.0`

`git config --local git-mob-config.use-local-template true`

### Enable GitHub author fetch

To fetch authors from GitHub you need to enable it using the config.

`type: Boolean`, `scope: global`, `version: 2.3.3`

`git config --global git-mob-config.github-fetch true`

## More commands

### List all co-authors

Check which co-authors you have available in your `.git-coauthors` file.

```
$ git mob --list
jd Jane Doe jane@example.com
ad Amy Doe amy@example.com
bd Bob Doe bob@example.com
```

### Overwrite the main author

Overwrite the current author which could be useful for pairing on different machines

If the current author is: **Bob Doe**

```
$ git mob -o jd ad
jd Jane Doe jane@example.com
ad Amy Doe amy@example.com
```

Now the author has changed to **Jane Doe**.

### Add co-author

Add a new co-author to your `.git-coauthors` file.

```
$ git add-coauthor bb "Barry Butterworth" barry@butterworth.org
```

### Delete co-author

Delete a co-author from your `.git-coauthors` file.

```
$ git delete-coauthor bb
```

### Edit co-author

Edit a co-author's details in your `.git-coauthors` file.

```
$ git edit-coauthor bb --name="Barry Butterworth" --email="barry@butterworth.org"
$ git edit-coauthor bb --name="Barry Butterworth"
$ git edit-coauthor bb --email="barry@butterworth.org"
```

### Suggest co-authors

Suggest co-authors to save based on contributors to the current Git repo.

Optional author filter by name or email.

```
$ git suggest-coauthors [author name | author email]
```

### Help

Find out more with `git mob -h`

### Add initials of current mob to your prompt

#### Bash

Add the initials to `PS1`, in `~/.bashrc`

```bash
function git_initials {
  local initials=$(git mob-print --initials)
  if [[ -n "${initials}" ]]; then
    echo " [${initials}]"
  fi
}

export PS1="\$(pwd)\$(git_initials) -> "
```

#### Fish

Add the following functions to `.config/fish/config.fish`

```fish
function git_initials --description 'Print the initials for who I am currently pairing with'
  set -lx initials (git mob-print --initials)
  if test -n "$initials"
    printf ' [%s]' $initials
  end
end

function fish_prompt
  printf "%s%s ->" (pwd) (git_initials)
end
```

## More info

[See git-mob discussions](https://github.com/rkotze/git-mob/discussions)

Read our blog post to find out why git-mob exists: [Co-author commits with Git Mob](http://tech.findmypast.com/co-author-commits-with-git-mob)

<sup>\* [If you have git-duet installed, you'll need to uninstall it](https://github.com/rkotze/git-mob/issues/2) since it conflicts with the git-solo command.</sup>
