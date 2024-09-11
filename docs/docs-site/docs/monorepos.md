---
sidebar_position: 4
---

# Support for monorepos

Cycli fully supports monorepos!

## How it works

If you want to run RNCC in a monorepo structure, run it from the root of package for which you want to generate workflows.

Cycli will automatically detect if you are in a monorepo and will adjust the configuration accordingly. It will
peform all necessary patches in the package level and generate workflows in `.github/workflows` directory at the root of the monorepo.

## Differences in generated workflows in monorepos

Workflows generated in monorepos will be a little different to ensure that they work correctly in a monorepo structure.

- name prefix
- paths field
- `--cwd` and `--prefix` flags for `yarn` and `npm` commands

## Example

Assume we have a monorepo with the following structure:

```bash
repo
├── apps
│   ├── package-a
│   │   └── ...
│   └── package-b
│       └── ...
├── package.json
└── yarn.lock
```

Say that `package-a` is a react native app for which we want to set up GitHub actions for Prettier and Maestro. We can run:

```bash
cd apps/package-a
npx setup-ci --preset --prettier --maestro
```

After running the script, we can see that a `.github/` directory has been created with the following content:

```bash
repo
# green-start
├── .github
│   └── workflows
│       ├── package-a-maestro.yml
│       └── package-a-prettier.yml
# green-end
├── apps
│   ├── package-a
│   │   └── file
│   └── package-b
│       └── file
├── package.json
└── yarn.lock
```

These are the generated workflows for `package-a` in the monorepo. Note that their name starts with the name of the package.
This is to ensure that all workflows generated in monorepo have unique names and can be easily identified.

If we inspect the contents of `package-a-prettier.yml`, we can see
some things specific to workflows generated in monorepos.

```yaml title=".github/workflows/package-a-prettier.yml" showLineNumbers
name: Prettier check

on:
  pull_request:
    # green-start
    paths:
      - apps/expo-app/**
    # green-end

jobs:
  prettier-check:
    name: Prettier check
    runs-on: ubuntu-latest
    steps:
      - name: 🏗 Setup repo
        uses: actions/checkout@v4

      - name: 📦 Install dependencies
        run: yarn

      - name: ✨ Run Prettier check
        # green
        run: yarn --cwd apps/expo-app prettier:check
```

- lines 5-6: sdadas
- line 20: blah blah
