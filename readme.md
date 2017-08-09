# Dranimate

### Setup and installation

`virtualenv init venv`
* Note: some versions of virtualenv don't require the 'init' command arg

`source venv/bin/activate`

`pip install -r server/requirements.txt`

### Dranimate server:
* `python server/manage.py migrate`
* `python server/manage.py runserver`

### Dranimate client:
* Requirements: node

#### Development:
* `npm install`
* `npm run dev`
* Open browser to localhost:3000

#### Build:
* `npm install`
* `npm run build`
* When vendor bundle gets implemented, this will work!
* NOTE: the build process currently assumes ES5, but babel transformer should be added

### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.
