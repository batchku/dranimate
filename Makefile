build:
	python server/manage.py collectstatic --no-input

run:
	python server/manage.py runserver

graph:
	python server/manage.py graph_models -a -g -o dranimate_visualized.png

install:
	pip install -r server/requirements.txt

venv:
	source server/venv/bin/activate
