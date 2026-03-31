PORT ?= 3000

.PHONY: dev build test migrate seed studio up down kill-port

kill-port:
	@PID=$$(lsof -ti :$(PORT)) && [ -n "$$PID" ] && echo "Killing process $$PID on port $(PORT)" && kill -9 $$PID || true

dev: kill-port
	cp -n .env.example .env 2>/dev/null || true
	npm run dev

build:
	npm run build

test:
	npm run test

generate:
	npx prisma generate

migrate:
	npx prisma migrate dev && npx prisma generate

migrate-prod:
	npx prisma migrate deploy

seed:
	npx ts-node --project tsconfig.seed.json prisma/seed/index.ts

studio:
	npx prisma studio

up:
	docker-compose up -d

down:
	docker-compose down

reset:
	docker-compose down -v
	docker-compose up -d
	sleep 3
	npx prisma migrate dev
	npx ts-node prisma/seed/index.ts
