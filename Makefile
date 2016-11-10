build:
	python3 server/manage.py collectstatic --no-input

run:
	python3 server/manage.py runserver 0.0.0.0:8080

migrate:
	python3 server/manage.py migrate

graph:
	python3 server/manage.py graph_models -a -g -o dranimate_visualized.png

install:
	pip install -r server/requirements.txt


# Have to install django-rest-framework-docs in this way
# see https://github.com/manosim/django-rest-framework-docs/issues/120
install_drfdoc:
	wget https://pypi.python3.org/packages/e5/9e/3a9aa6908ad7bd95b46f7fe05256681f4101de9a7769b6928159a986ef61/drfdocs-0.0.11.tar.gz
	tar xvzf drfdocs-0.0.11.tar.gz
	cd drfdocs-0.0.11 && rm -rf ./site/ && python3 setup.py install
	rm -rf drfdocs-0.0.11
	rm -rf drfdocs-0.0.11.tar.gz*