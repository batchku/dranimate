# Dranimate

### Setup

`virtualenv init venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

How to run the Dranimate server: `python manage.py runserver`

### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.
