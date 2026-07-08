SHELL := /bin/bash

GCP_PROJECT ?= moviestracker
GCP_REGION ?= europe-west1
GAR_REPOSITORY ?= moviestracker
IMAGE_NAME ?= web
IMAGE ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/$(GAR_REPOSITORY)/$(IMAGE_NAME)
SERVICE ?= moviestracker-app
LOCAL_IMAGE ?= moviestracker:local
LOCAL_URL ?= http://127.0.0.1:3000

define check-tag
	@if [ -z "$(TAG)" ]; then \
		echo "TAG is required (for example: make $@ TAG=$$(git rev-parse --short HEAD))"; \
		exit 1; \
	fi
endef

define check-digest
	@case "$(DIGEST)" in \
		sha256:[0-9a-f][0-9a-f]*) ;; \
		*) echo "DIGEST must be an immutable sha256:<digest> value"; exit 1 ;; \
	esac
endef

define check-revision
	@if [ -z "$(REVISION)" ]; then \
		echo "REVISION is required"; \
		exit 1; \
	fi
endef

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
docker-build: ## Build the production image locally
	docker build --tag $(LOCAL_IMAGE) .

.PHONY: docker-run
docker-run: ## Run the local production image on port 3000
	docker run --rm --publish 3000:3000 \
		--env AUTH_SECRET \
		--env AUTH_URL=$(LOCAL_URL) \
		$(LOCAL_IMAGE)

.PHONY: smoke
smoke: ## Smoke-test a running deployment with LOCAL_URL
	./scripts/smoke-deployment.sh $(LOCAL_URL)

.PHONY: docker-build-push
docker-build-push: ## Build, attest, and push image to Artifact Registry (requires TAG)
	$(call check-tag)
	docker buildx build \
		--platform linux/amd64 \
		--provenance=mode=max \
		--sbom=true \
		--tag $(IMAGE):$(TAG) \
		--push .

.PHONY: gcloud-deploy-candidate
gcloud-deploy-candidate: ## Deploy an immutable Cloud Run candidate without traffic (requires DIGEST)
	$(call check-digest)
	gcloud run deploy $(SERVICE) \
		--image=$(IMAGE)@$(DIGEST) \
		--no-traffic \
		--region=$(GCP_REGION) \
		--project=$(GCP_PROJECT)

.PHONY: gcloud-promote
gcloud-promote: ## Promote a verified Cloud Run revision (requires REVISION)
	$(call check-revision)
	gcloud run services update-traffic $(SERVICE) \
		--to-revisions=$(REVISION)=100 \
		--region=$(GCP_REGION) \
		--project=$(GCP_PROJECT)
