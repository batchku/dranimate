# Dranimate

### Setup


#### Install pip if you don't have it
```
xcode-select --install
sudo easy_install pip
```

#### Install virtualenv if you don't have it
`sudo pip install virtualenv`


#### Clone repo and install dependencies
```
git clone https://github.com/cmuartfab/dranimate.git
cd dranimate
pip install -r server/requirements.txt
```

#### Setup virtual env
`virtualenv init venv`
* Note: some versions of virtualenv don't require the 'init' command arg

`source venv/bin/activate`

### How to run the Dranimate server:
```
python server/manage.py migrate
python server/manage.py runserver
```
### Image segmentation + Mesh generation
* Click and drag to select area; control-click and drag to subtract area
* Press 'p' to add a new control point

### Puppeteering
* Click and drag to move control points

### Browser Web-Cam Handtracking
* to use with Chrome you need to host the webpage on a webserver (Chrome doesnt allow video streams otherwise). Follow the instructions above to create a python simple server.

