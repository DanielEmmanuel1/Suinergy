#[test_only]
module suinergy::flow_tests {
    use sui::test_scenario;
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::clock::{Self};
    
    use suinergy::registry::{Self, ProtocolConfig};
    use suinergy::vault::{Self, Vault};

    #[test]
    fun test_end_to_end_flow() {
        let admin = @0xAD;
        let user = @0xB0B;

        let mut scenario = test_scenario::begin(admin);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // 1. Init Registry
        {
            registry::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, admin);

        // 2. Init Vault
        {
            vault::init_vault<SUI>(test_scenario::ctx(&mut scenario));
            // Note: Mock adapter not needed for basic vault deposit/withdraw test
        };

        test_scenario::next_tx(&mut scenario, admin);

        // 3. User Deposits into Vault
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut vault = test_scenario::take_shared<Vault<SUI>>(&scenario);
            let config = test_scenario::take_shared<ProtocolConfig>(&scenario);
            
            let coin = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            let position = vault::deposit(&mut vault, &config, coin, test_scenario::ctx(&mut scenario));
            
            assert!(suinergy::position::shares(&position) == 1000, 0);

            let _coin = vault::withdraw(&mut vault, &config, position, test_scenario::ctx(&mut scenario));
            // burn coin
            coin::burn_for_testing(_coin);

            test_scenario::return_shared(vault);
            test_scenario::return_shared(config);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
