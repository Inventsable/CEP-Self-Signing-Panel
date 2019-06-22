# CEP Self-Signing Panel

## This panel can stage, sign and certify itself in a single command:

> (node package coming soon!)
> ![](https://thumbs.gfycat.com/KaleidoscopicConsciousIberiannase-size_restricted.gif)

## Adding this functionality to your own panel

### 1. Copy and paste the following into your `package.json` under `devDependencies`:

```json
    "boxen": "^4.1.0",
    "chalk": "^2.4.2",
    "core-js": "^2.6.5",
    "fs-extra": "^8.0.1",
    "inquirer": "^6.4.1",
    "make-runnable": "^1.3.6",
    "ora": "^3.4.0",
    "shelljs": "^0.8.3",
```

### 2. We create custom tasks by pasting this into the `scripts` section of your `package.json`:

```json
    "sign": "node ./src/utils/dev/signAndCertify.js init",
    "switch": "node ./src/utils/dev/switchContext.js init"
```

This creates a command named `sign`, which will be used as `npm run sign`. It uses [make-runnable](https://github.com/super-cache-money/make-runnable) to allow a `node [path-to-file] [name-of-function] [parameters-to-pass]` syntax, so the above `node ./src/utils/dev/signAndCertify.js init` is pointing to a function named `init()` (with no parameters) inside the `signAndCertify.js` file. Same for `switch`!

> You can see the above in action within [this repo's own package.json](https://github.com/Inventsable/CEP-Self-Signing-Panel/blob/master/package.json)

### 3. Copy [the ./src/utils/dev folder from this repo](https://github.com/Inventsable/CEP-Self-Signing-Panel/tree/master/src/utils/dev) to the same path (or copy files and adjust package.json for your own paths)

### 4. You must have ZXPSignCmd.exe within the parent folder of your extension

If you're currently developing a panel whose path is `.../appData/Roaming/Adobe/CEP/extensions/myPanel`, ZXPSignCmd.exe must be in `.../appData/Roaming/Adobe/CEP/extensions`.

```bash
# Now re-run npm install
npm install

# Now try your new task
npm run sign
```

## What do they do?

### `npm run sign` will:

- Duplicate and "stage" an extension folder to a temporary location, removing any hidden files or folders to ensure the certificate doesn't silently fail.
- Generate a temporary certificate
- Sign the duplicate with the certificate
- Check the validation of the signed duplicate
- Place the resulting `[name][version].zxp` into `./archive` of your current panel (and create this folder if it doesn't already exist). If `[name][version].zxp` already exists, overwrite it.
- Delete the duplicate directory

### `npm run switch` will:

- Report whether the manifest is currently prepped for `PRODUCTION` or `DEVELOPER` context.
- Prompt the user if they'd like to switch contexts.
- If switching contexts, automatically adjusts `manifest.xml` for you (no need to manually open it and switch every time)
- Prompt with contextual information about the next steps once the confirmation is made.

![](https://thumbs.gfycat.com/AnimatedCaringAardwolf-size_restricted.gif)
