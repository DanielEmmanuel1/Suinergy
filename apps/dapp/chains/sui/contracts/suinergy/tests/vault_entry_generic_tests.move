#[test_only]
module suinergy::vault_entry_generic_tests {
    use sui::test_scenario;
    use sui::coin;
    use sui::test_coin::{Self, TestCoin};

    use suinergy::registry;
    use suinergy::vault::{Self, Vault};
    use suinergy::vault_entry;

    #[test]
    fun deposit_and_withdraw_generic() {
        let admin = @0xA;
        let user = @0xB;

        let mut scenario = test_scenario::begin(admin);

        // Init protocol config
        registry::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, admin);

        // Init a vault for a generic coin type (TestCoin)
        vault::init_vault<TestCoin>(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, admin);

        // User deposit
        test_scenario::next_tx(&mut scenario, user);
        let mut vault_obj = test_scenario::take_shared<Vault<TestCoin>>(&scenario);
        let config = test_scenario::take_shared<registry::ProtocolConfig>(&scenario);

        let payment = test_coin::mint(1_000, test_scenario::ctx(&mut scenario));

        let position = vault_entry::deposit<TestCoin>(
            &mut vault_obj,
            &config,
            payment,
            test_scenario::ctx(&mut scenario)
        );

        assert!(suinergy::position::shares(&position) == 1_000, 0);

        let withdrawn = vault_entry::withdraw<TestCoin>(
            &mut vault_obj,
            &config,
            position,
            test_scenario::ctx(&mut scenario)
        );

        assert!(coin::value(&withdrawn) == 1_000, 0);
        coin::burn(withdrawn);

        test_scenario::return_shared(vault_obj);
        test_scenario::return_shared(config);

        test_scenario::end(scenario);
    }
}

