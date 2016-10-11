build:
	python3 server/manage.py collectstatic --no-input

run:
	python3 server/manage.py runserver

graph:
	python3 server/manage.py graph_models -a -g -o dranimate_visualized.png


