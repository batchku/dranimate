build:
	python server/manage.py collectstatic --no-input

run:
	python server/manage.py runserver 0.0.0.0:8080

migrate:
	python server/manage.py migrate

graph:
	python server/manage.py graph_models -a -g -o dranimate_visualized.png

install:
	pip install -r server/requirements.txt

