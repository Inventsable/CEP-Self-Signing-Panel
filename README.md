# CEP Self-Signing Panel

## This panel can stage, sign and certify itself in a single command:

> (node package coming soon!)
> ![](https://thumbs.gfycat.com/KaleidoscopicConsciousIberiannase-size_restricted.gif)

## Adding this functionality to your own panel

### 1. Copy and paste the following into your `package.json` under `dependencies`:

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

### 2. Let's create a custom task by pasting this into your `scripts` section of the `package.json`:

```json
    "sign": "node ./src/utils/signAndCertify.js init"
```

This creates a command named `sign`, which will be used as `npm run sign`. It uses [make-runnable](https://github.com/super-cache-money/make-runnable) to allow a `node [path-to-file] [name-of-function] [parameters-to-pass]` syntax, so the above `node ./src/utils/signAndCertify.js init` is pointing to a function named `init()` (with no parameters) inside the `signAndCertify.js` file.

> See the above in [this repo's own package.json](https://github.com/Inventsable/CEP-Self-Signing-Panel/blob/master/package.json)

### 3. Copy [the signAndCertify.js file from this repo](https://github.com/Inventsable/CEP-Self-Signing-Panel/blob/master/src/utils/signAndCertify.js) to the same path as your command above

### 4. You must have ZXPSignCmd.exe within the parent folder of your extension

If you're currently developing a panel whose path is `.../appData/Roaming/Adobe/CEP/extensions/myPanel`, ZXPSignCmd.exe must be in `.../appData/Roaming/Adobe/CEP/extensions`.

```bash
# Now re-run npm install
npm install

# Now try your new task
npm run sign
```

## What does it do?

### This command will:

- Duplicate and "stage" an extension folder to a temporary location, removing any hidden files or folders to ensure the certificate doesn't silently fail.
- Generate a temporary certificate
- Sign the duplicate with the certificate
- Check the validation of the signed duplicate
- Place the resulting `[name][version].zxp` into `./archive` of your current panel (and create this folder if it doesn't already exist). If `[name][version].zxp` already exists, overwrite it.
- Delete the duplicate directory
