# Troubleshooting 🔍

## Known issues 📌

> [!NOTE]
> You can also check [Reported Bugs](https://github.com/software-mansion/setup-ci/issues?q=is%3Aissue+label%3A%22%F0%9F%AA%B2+bug%22+).

#### Missing runtime version from app.json/app.config.js

If during `setup-ci` execution you see one of the following errors: `Error: A runtime version is set in your AndroidManifest.xml,
but is missing from your app.json/app.config.js.` or
`Error: [ios.expoPlist]: withIosExpoPlistBaseMod: A runtime version is set in your Expo.plist, but is missing from your app.json/app.`, you either need to remove `android/` and `ios/`
directories in your project and re-run (if your project is using [CNG](https://docs.expo.dev/workflow/continuous-native-generation/))
or add `runtimeVersion` field to your `app.json`/`app.config.js` file.

## Bug reports 🐛

If you were unable to find a solution to your problem, please fill a bug report [here](https://github.com/software-mansion/setup-ci/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=).
