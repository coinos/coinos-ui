#!/usr/bin/env bash
set -euo pipefail

# --- Staging E2E test runner ---
# Runs tests against staging.coinos.io that don't require docker/local infra.
#
# Usage:
#   ./test/e2e/run-staging.sh              # headless
#   ./test/e2e/run-staging.sh headed       # visible browser
#   ./test/e2e/run-staging.sh debug        # Playwright inspector
#   ./test/e2e/run-staging.sh <spec>       # run a specific test file

export E2E_BASE_URL="${E2E_BASE_URL:-https://staging.coinos.io}"
export E2E_API_BASE_URL="${E2E_API_BASE_URL:-https://staging.coinos.io/api}"
export E2E_SKIP_WEBSERVER=1

# Test accounts — create these on staging first
export E2E_ALICE_USERNAME="${E2E_ALICE_USERNAME:-testalice}"
export E2E_ALICE_PASSWORD="${E2E_ALICE_PASSWORD:-testpw123}"
export E2E_BOB_USERNAME="${E2E_BOB_USERNAME:-testbob}"
export E2E_BOB_PASSWORD="${E2E_BOB_PASSWORD:-testpw123}"

# login-balance.spec.ts uses E2E_USERNAME/E2E_PASSWORD
export E2E_USERNAME="${E2E_USERNAME:-$E2E_BOB_USERNAME}"
export E2E_PASSWORD="${E2E_PASSWORD:-$E2E_BOB_PASSWORD}"

# Test secret for ark endpoints (must match staging server config)
export E2E_TEST_SECRET="${E2E_TEST_SECRET:-}"

# Ark wallet password for vault creation/unlock
export E2E_ARK_WALLET_PASSWORD="${E2E_ARK_WALLET_PASSWORD:-testpw123}"

# Tests that work against staging (no docker exec / local node deps)
STAGING_SPECS=(
  "test/e2e/login-balance.spec.ts"
  "test/e2e/custodial-send-username.spec.ts"
  "test/e2e/custodial-send-lightning.spec.ts"
  "test/e2e/custodial-bitcoin-send.spec.ts"
  "test/e2e/ark-receive-from-server-wallet.spec.ts"
  "test/e2e/ark-send-custodial.spec.ts"
  # vault/ark tests — client-side SDK signing is unreliable
  # "test/e2e/ark-vault-to-custodial.spec.ts"
  # "test/e2e/ark-custodial-receive.spec.ts"
  # "test/e2e/vault-send-bitcoin.spec.ts"
  # "test/e2e/vault-send-to-custodial-btc.spec.ts"
)

MODE="${1:-}"

case "$MODE" in
  headed)
    npx playwright test "${STAGING_SPECS[@]}" --project=chromium --headed --workers=1
    ;;
  debug)
    export PWDEBUG=1
    npx playwright test "${STAGING_SPECS[@]}" --project=chromium --headed --workers=1
    ;;
  test/e2e/*.spec.ts)
    # Run a specific test file
    npx playwright test "$MODE" --project=chromium --workers=1
    ;;
  *)
    npx playwright test "${STAGING_SPECS[@]}" --project=chromium --workers=1
    ;;
esac
