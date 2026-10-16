# Atalhos padronizados. Equivalentes npm no README (Make e opcional no Windows).

.PHONY: setup dev demo db migrate seed test lint build clean

setup:
	npm install
	cp -n .env.example .env || true

dev:
	npm run dev

demo:
	npm run dev:demo

db:
	docker compose up -d db

migrate:
	npm run db:migrate

seed:
	npm run db:seed

test:
	npm run test:coverage

lint:
	npm run lint

build:
	npm run build

clean:
	rm -rf .next coverage
