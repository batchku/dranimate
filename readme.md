# Dranimate

### Requirements
- NodeJS 12
- NPM 6
- Firebase CLI 7

### Setup
1. Inside project install all 3rd party libraries:
```
npm install
```
2. Run local dev server
```
npm run dev
```
3. Open following URL in Chrome: `localhost:5000`

### Deploy to Firebase
1. Build application:
```
npm run build
```
2. Deploy to firebase:
```
firebase deploy
```

### TODO
* Leap motion tuning (make it work like OFX dranimate)
* Puppet editor: make editor area resizable / responsive
* Put SLIC algorithm in web worker: currently it blocks the main thread, causing the loader to not appear
* GIF sharing
* Define finite stage area
* Background images
* When saving GIF to server, generate smaller sizes
* Hot / Cold control points: disallow dragging hot control point
* Infamous old issue: https://github.com/cmuartfab/dranimate-browser/issues/3
