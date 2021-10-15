# Gulp basis

## First of all install extentions for VS-Code

If you don't have prettier or stylelint in your VS-Code
Use command line

```
code --install-extension esbenp.prettier-vscode
code --install-extension stylelint.vscode-stylelint
```

## Next step

For normal use in VS-Code, you need to add the following lines to settings.json (for default open ctrl+shift+p and type "Open settings(JSON)")

```
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
  "source.fixAll.stylelint": true
},
```

## Now you can install all packages

In your directory type this command

```
npm install
```

## Usage

For development use

```
npm run dev
```

For production build use

```
npm run prod
```
