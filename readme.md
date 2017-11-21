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


### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.
