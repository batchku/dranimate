# Dranimate

### Requirements
- install (homebrew)[https://brew.sh/]:
- install node.js: `brew install node` or `brew upgrade node`

### Setup
- user Terminal to navigate to the folder where you wish to install this app
- clone this repo
```
https://github.com/cmuartfab/dranimate.git
```
- switch to the `some-webpack` branch with
```
git checkout some-webpack
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


### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.
