SHELL := /bin/bash

GCP_PROJECT ?= moviestracker
GCP_REGION ?= europe-west1
GAR_REPOSITORY ?= moviestracker
IMAGE_NAME ?= web
IMAGE ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/$(GAR_REPOSITORY)/$(IMAGE_NAME)
SERVICE ?= moviestracker-app
LOCAL_IMAGE ?= moviestracker:local
LOCAL_URL ?= http://127.0.0.1:3000

.PHONY: help
help: ## Show available targets
	@grep -E '^[a-zA-Z0-9._-]+:.*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?##"}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

.PHONY: dev
dev: ## Run the local development server
	bun run dev

.PHONY: verify
verify: ## Run the main local verification gate
	bun run verify

.PHONY: docker-build
docker-build: ## Build the production image locally (local diagnostics only)
	docker build --tag $(LOCAL_IMAGE) .

.PHONY: docker-run
docker-run: ## Run the local production image on port 3000 (local diagnostics only)
	docker run --rm --publish 3000:3000 \
		--env AUTH_SECRET \
		--env AUTH_URL=$(LOCAL_URL) \
		$(LOCAL_IMAGE)

.PHONY: smoke
smoke: ## Smoke-test a running deployment with LOCAL_URL
	./scripts/smoke-deployment.sh $(LOCAL_URL)
