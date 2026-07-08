#!/usr/bin/env bash
set -euo pipefail

base_url="${1:?usage: smoke-deployment.sh BASE_URL}"
base_url="${base_url%/}"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

curl_args=(
	--fail
	--show-error
	--silent
	--connect-timeout 5
	--max-time 20
	--retry 3
	--retry-all-errors
	--retry-delay 2
	--header "Cache-Control: no-cache"
)

# --- Root endpoint: app is behind auth guard and redirects to /auth ---
# Follow the redirect to verify the app serves content (not a 5xx crash).
curl "${curl_args[@]}" \
	--location \
	--dump-header "${work_dir}/root.headers" \
	--output "${work_dir}/root.body" \
	"${base_url}/"

grep --fixed-strings --quiet "Moviestracker" "${work_dir}/root.body"
grep --extended-regexp --ignore-case --quiet \
	'^x-content-type-options:[[:space:]]*nosniff' \
	"${work_dir}/root.headers"

# --- Auth page ---
curl "${curl_args[@]}" \
	--dump-header "${work_dir}/auth.headers" \
	--output "${work_dir}/auth.body" \
	"${base_url}/auth/?lang=en-US"

grep --fixed-strings --quiet "Moviestracker" "${work_dir}/auth.body"
grep --extended-regexp --ignore-case --quiet \
	'^x-content-type-options:[[:space:]]*nosniff' \
	"${work_dir}/auth.headers"

echo "Smoke check passed: ${base_url}"
