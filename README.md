# Git Mob [![npm version](https://badge.fury.io/js/git-mob.svg)](https://badge.fury.io/js/git-mob)

A command-line tool for social coding. Includes co-authors in commits.

Whether you're pairing with a buddy at a shared computer, or mobbing with your
team in front of a projector, git mob has got you covered.

## Install

**Warning: This package hasn't reached v1.0.0 yet. There may be many missing
features, lots of bugs, and the API could change until we reach a stable version.**

git-mob is a CLI tool, so you'll need to install the package globally.

```
npm i -g git-mob
```

## Workflow / Usage

With git-mob, the primary author will always be the primary user of the computer.
Set your author info in git if you haven't done so before.

```
$ git config --global user.name "Jane Doe"
$ git config --global user.email "jane@example.com"
```

To keep track of potential co-authors, git-mob uses a YAML file called `~/.git-authors`.
Here's a template of its structure.

```
authors:
  <initials>: <name>; <email_prefix>
email:
  domain: <email_domain>
```

Start by adding a few co-authors that you work with.

```
$ cat <<-EOF > ~/.git-authors
authors:
  ad: Amy Doe; amy
  bd: Bob Doe; bob
email:
  domain: example.com
EOF
```

You're ready to create your mob. Tell git-mob you're pairing with Amy by using her initials.

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

Once you're done mobbing, switch back to developing solo.

```
$ git solo
Jane Doe <jane@example.com>
```

Find out more with `git mob --help`
