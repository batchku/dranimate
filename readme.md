# Dranimate

## Installation
### Requirements
- install (homebrew)[https://brew.sh/]: 
- install node.js: `brew install node`

### Setup
- user Terminal to navigate to the folder where you wish to install this app
- clone this repo with `https://github.com/cmuartfab/dranimate.git`
- switch to the `beta` branch with `git checkout beta`
- switch to browser folder with `cd browser` 
- install node dependencies with `npm install`
- run the python SimpleHTTPServer with `python -m SimpleHTTPServer 8000`
- open Chrome and point it to `localhost:8000`


## Usage

### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.
