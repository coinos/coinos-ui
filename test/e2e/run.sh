#!/usr/bin/env bash
set -euo pipefail

export ENABLE_E2E_TEST_ENDPOINTS=true
export E2E_TEST_SECRET=local-e2e-secret
export ARK_SERVER_WALLET_PRIVATE_KEY=0ebe9a690651e9e08d7c2f4db106d8ec264725241fdb34c57aedb26155b0e027

SPEC="test/e2e/ark-receive-from-server-wallet.spec.ts"
MODE="${1:-}"

case "$MODE" in
  headed)
    playwright test "$SPEC" --project=chromium --headed --workers=1
    ;;
  watch)
    export E2E_SLOWMO=350
    export E2E_PAUSE_AT_END=true
    playwright test "$SPEC" --project=chromium --headed --workers=1 --retries=0 --timeout=120000 --global-timeout=180000
    ;;
  debug)
    export PWDEBUG=1
    playwright test "$SPEC" --project=chromium --headed --workers=1
    ;;
  *)
    playwright test "$SPEC" --project=chromium --workers=1
    ;;
esac
