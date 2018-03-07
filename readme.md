# Dranimate

### Requirements
- install [homebrew](https://brew.sh/):
- install node.js: `brew install node` or `brew upgrade node`
  - It is probably best to have node version >= 8 and npm version >= 5
  - `node -v; npm -v`

### Setup
- user Terminal to navigate to the folder where you wish to install this app
- clone this repo
```
git clone git@github.com:cmuartfab/dranimate-browser.git
```

- install node dependencies with
```
npm install
```

- run local server
```
npm run dev
```

- open Chrome and point it to `localhost:5000`

### Other commands
- Run tests
```
npm run test
```
- Run linter (will require a lot of work to make this practical)
```
npm run lint
```
- Build to dist (for hosting on a web server)
```
npm run build
```
- Deploy to gh-pages (this deploys your current project)
```
npm run deploy
```
- Deploy origin/master to gh-pages
```
git clone --depth 1 --branch master git@github.com:cmuartfab/dranimate-browser.git;
cd dranimate-browser;
npm install;
npm run deploy;
```

### TODO
* Leap motion tuning (make it work like OFX dranimate)
* Puppet editor: make editor area resizable / responsive
* Start / Stop master render loop where appropriate: currently the render loop is always on
* Put SLIC algorithm in web worker: currently it blocks the main thread, causing the loader to not appear
* GIF sharing
* Infamous old issues: https://github.com/cmuartfab/dranimate-browser/issues/3
