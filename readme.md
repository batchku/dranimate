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

### TODO
* Firebase integration
  - View puppets
  - Load puppet
  - Save puppet
  - Authentication
* Leap motion tuning (make it work like OFX dranimate)
* Known areas for improvement
  - GIF recording: make gif from recorded positions instead of realtime gif recording
  - Puppet editor: make editor area resizable / responsive
  - Puppet recording: iron out bug where recording tries to catch up (appears as visual glitch)
  - Start / Stop master render loop where appropriate: currently the render loop is always on
  - Put SLIC algorithm in web worker: currently it blocks the main thread, causing the loader to not appear
* Infamous old issues: https://github.com/cmuartfab/dranimate-browser/issues/3
