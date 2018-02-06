# Git Mob

A command-line tool for social coding. Includes co-authors in commits.

Whether you're pairing with a buddy at a shared computer, or mobbing with your
team in front of a projector, git mob has got you covered.

## Comparison versus existing tools

TODO

## Workflow / Usage

Scenario: Jane pairs with her friend Amy

1. Jane just installed git-mob. The first thing she does is define herself a potential author in the `~/.git-authors` file.

```
authors:
  <initials>: <name>; <email_prefix>
email:
  domain: <email_domain>
```

```
$ cat <<-EOF > ~/.git-authors
authors:
  jd: Jane Doe; jane
email:
  domain: example.com
EOF
```

...

TODO: amy has a different email, use `email_addresses:` section

```
authors:
  jd: Jane Doe; jane
  aw: Amy Winehouse
email:
  domain: example.com
email_addresses:
  aw: amy@winehouse.dev
```

1. Jane, the committer, specifies Amy as a co-author of the mob.

```
git mob aw
```

Scenario: TODO: pair with coworkers (email template)

## MVP

* local support

* disable mob (i.e. solo)

* append to .gitmessage (so we don't overwrite existing file)

## Future

* only set commit template when it doesn't exist

* global support

* support `email_addresses` in `.git-authors` file

* support `email_template` in `.git-authors` file?
