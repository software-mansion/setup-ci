---
sidebar_position: 2
---

# Package Managers

RNCC will automatically detect your package manager based on the presence of a `yarn.lock` or `package-lock.json` file in the root of your repository.
This step is crucial to ensure that dependencies are installed properly and generated workflows will work as expected.

:::caution
In case you have both `yarn.lock` and `package-lock.json` are detected, the script will default to one of them at random.
:::

## Supported package managers

| Package manager | Status           |
| --------------- | ---------------- |
| yarn            | ✅ full support  |
| npm             | ✅ full support  |
| pnpm            | ❌ not supported |
| bun             | ❌ not supported |
