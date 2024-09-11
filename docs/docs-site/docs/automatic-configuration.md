---
sidebar_position: 3
---

# Automatic configuration

Apart from creating workflow `yaml` files, RNCC will attempt to automatically perform as much necessary configuration as possible for you.
This includes:

- installing necessary dependencies
- patching `.json` configuration files (e.g. `app.json` or `eas.json`)
- adding scripts to `package.json`
- generating default configuration files if they are not yet present in the project (e.g. `.prettierrc` for Prettier)

## Limitations

Unfortunatelly, there are things that RNCC cannot do automatically. In such cases, you will need
to perform them manually. Hovewer, **RNCC will provide you with instructions** on what needs to be done
in form of **further actions** list printed at the end of script execution, or during the script
execution using interactive prompts.

(ALSO SCREENSHOT WITH HARD STOP IN DETOX)
(HERE SCREENSHOT WITH THIS BOX)

- patching native code
- updating dynamic configuration files (like `app.config.js`)
- creating repository secrets (like `EXPO_TOKEN`)
