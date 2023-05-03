start-dev:
	docker compose --env-file .development.env -f docker-compose.dev.yml up -d
	yarn start:dev

start:
	docker compose --env-file .production.env -f docker-compose.prod.yml up -d
	yarn start

down-dev:
	docker compose --env-file .development.env -f docker-compose.dev.yml down

down:
	docker compose --env-file .production.env -f docker-compose.prod.yml down