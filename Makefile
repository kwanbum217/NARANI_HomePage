.DEFAULT_GOAL := help
SHELL := /bin/bash
PORT ?= 4322

.PHONY: help setup dev build preview verify links check-emoji hooks clean

help: ## 사용 가능한 타깃을 출력합니다
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: ## 의존성을 lockfile 기준으로 설치합니다
	npm ci

dev: ## 개발 서버를 실행합니다
	npm run dev

build: ## dist/ 를 생성합니다
	npm run build

preview: ## 빌드 결과를 로컬에서 확인합니다
	npm run preview

verify: ## 빌드 + 링크/렌더/접근성/인터랙션 검증 (macOS)
	npm run verify

links: ## dist/ 링크 무결성만 검사합니다
	npm run links

check-emoji: ## 저장소 규칙(이모지 금지)을 검사합니다
	npm run check:emoji

hooks: ## pre-commit 훅을 설치합니다
	pre-commit install --install-hooks
	pre-commit install --hook-type commit-msg

clean: ## 생성물을 제거합니다
	rm -rf dist .astro .verify
