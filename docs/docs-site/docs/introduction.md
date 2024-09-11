---
sidebar_position: 1
---

# Introduction

React Native CI CLI is a tool that is cool 8)

Something about what it does:

- generate CI/CD workflow yaml files
- add necessary dependencies
- update package.json with scripts
- update other configuration files like app.json, eas.json etc.
- generate default configuration for supported tools (e.g. default `.prettierrc` for Prettier)

(more info for each specific workflow in Workflows section)

Something about how we are opinionated and want to promote all the good patterns/practices like caching, linting, testing, etc.

Like why use RNCC? Caching, reducing billing time, easy to use, compatible with create-expo-stack (!)
Also compatibility table? With other project bootstrapers? (also that it can be used in expo and not only)

:::caution
Currently, RNCC only supports **GitHub Actions** as a CI/CD provider. Support for other platforms is planned for the future.
:::

## Getting started

Go to your project directory and run

```bash
npx setup-ci
```

## Run using presets

To skip interactive prompts at the beggining of the script, you can specify your own preset with option flags. For example, to set up Jest and ESLint, you can run:

```bash
npx setup-ci --preset --jest --lint
```

:::tip
You can find more information about available option flags using `npx setup-ci --help`
:::
