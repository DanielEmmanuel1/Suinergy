# Suinergy Contract Tests

This directory contains Move unit tests for the Suinergy protocol.
Testing locally is faster and safer than deploying to testnet.

## Running Tests

To run all tests:
```bash
sui move test
```

To run a specific test file:
```bash
sui move test vault_tests
```

To run a specific test function:
```bash
sui move test test_usdc_deposit_withdraw
```

## Writing New Tests

1. Create a new file in `tests/` (e.g., `tests/strategy_tests.move`).
2. Add `#[test_only]` at the top of the module.
3. Import `sui::test_scenario` and your modules.
4. Write test functions annotated with `#[test]`.

## Key Test Files

*   `vault_tests.move`: Tests for Vault initialization, deposits (SUI & USDC), and withdrawals.
*   `flow_tests.move`: End-to-end flow tests.

## Debugging

Use `std::debug::print(&value)` to print values during tests.
Run with `--gas-limit 1000000000` if you hit gas limits.
