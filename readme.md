# <p align="center"> react-native-ci-cli</p>

<p align="center">CLI to simplify CI setup in your React Native project.</p>

## 📖 Usage

Simply go to your project root directory and run `npx react-native-ci-cli`. If your project has monorepo structure, run the script from the root
directory of the app for which you want to setup workflows.

## 💡 Example

Say we want to setup GitHub actions that run ESLint check and Jest tests on our project every time we create or push to an existing Pull Request. 
Let's try to use `react-native-ci-cli` to do the heavy lifting and generate all the necessary configuration.

<p align="center">
  <img 
    style="width: 80%;"
    src="https://s10.gifyu.com/images/S59js.gif"/>
</p>

Alternatively, we can go fully automatic by passing flags `--silent --lint --jest` to avoid all interaction with the script. You can check the section below for more information about available flags!

## ⚙️ Features

* **Currently only GitHub actions are supported as your CI.**
* **npm** and **yarn** are supported as package managers and they will be detected automatically.
* Monorepo structure is supported, but make sure you run the script from app directory, 
  not the monorepo root.

When using `react-native-ci-cli`, you can provide additional flags to modify its default behavior.

- `--silent`: Run the script in silent mode. Combine it with feature flags to specify what workflows you want to generate.
- `--skip-git-check`:  By default, the script will prompt the user if there are uncommited changes in working repository. Use this flag to proceed without asking.

The following are **feature flags** that can use in silent mode (they are ignored if `--silent` flag is not provided).

- `--lint`: Generate ESLint workflow to run on every PR.
- `--jest`: Generate Jest workflow to run on every PR.
- `--ts`: Generate Typescript check workflow to run on every PR.

## 💬 Your feedback

This tool is supposed to be helpful to as many developers as possible - and therefore we are open for your ideas and general feedback! If you want to share your opinion about `react-native-ci-cli` or
have some thoughts about how it could be further developed, don't hesitate to create an issue or contact 
the maintainers directly.

## 📋 License

MIT - see LICENSE
