#[test_only]
module suinergy::vault_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    
    use suinergy::registry::{Self, ProtocolConfig};
    use suinergy::vault::{Self, Vault};
    use suinergy::vault_entry;
    use suinergy::position::{Self, UserPosition};

    // Mock USDC type
    public struct USDC has drop {}

    #[test]
    fun test_sui_deposit_withdraw() {
        let admin = @0xAD;
        let user = @0xB0B;

        let mut scenario = test_scenario::begin(admin);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // 1. Init Registry
        registry::init_for_testing(test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, admin);

        // 2. Init SUI Vault
        vault::init_vault<SUI>(test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, user);

        // 3. Deposit SUI
        {
            let mut vault = test_scenario::take_shared<Vault<SUI>>(&scenario);
            let config = test_scenario::take_shared<ProtocolConfig>(&scenario);
            
            let amount = 1000000000; // 1 SUI
            let coin = coin::mint_for_testing<SUI>(amount, test_scenario::ctx(&mut scenario));
            
            // Use vault_entry wrapper to test the entry function logic
            vault_entry::deposit_sui(&mut vault, &config, coin, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(vault);
            test_scenario::return_shared(config);
        };

        test_scenario::next_tx(&mut scenario, user);

        // 4. Verify Position and Withdraw SUI
        {
            let mut vault = test_scenario::take_shared<Vault<SUI>>(&scenario);
            let config = test_scenario::take_shared<ProtocolConfig>(&scenario);
            let position = test_scenario::take_from_sender<UserPosition>(&scenario);

            assert!(position::shares(&position) == 1000000000, 1);

            // Test withdraw_sui entry function
            vault_entry::withdraw_sui(&mut vault, &config, position, test_scenario::ctx(&mut scenario));

            test_scenario::return_shared(vault);
            test_scenario::return_shared(config);
        };

        test_scenario::next_tx(&mut scenario, user);

        // 5. Verify received coin
        {
            let coin = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1000000000, 2);
            test_scenario::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_usdc_deposit_withdraw() {
        let admin = @0xAD;
        let user = @0xB0B;

        let mut scenario = test_scenario::begin(admin);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // 1. Init Registry
        registry::init_for_testing(test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, admin);

        // 2. Init USDC Vault
        vault::init_vault<USDC>(test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, user);

        // 3. Deposit USDC
        {
            let mut vault = test_scenario::take_shared<Vault<USDC>>(&scenario);
            let config = test_scenario::take_shared<ProtocolConfig>(&scenario);
            
            let amount = 1000000; // 1 USDC (6 decimals)
            let coin = coin::mint_for_testing<USDC>(amount, test_scenario::ctx(&mut scenario));
            
            // Use generic deposit entry function
            vault_entry::deposit<USDC>(&mut vault, &config, coin, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(vault);
            test_scenario::return_shared(config);
        };

        test_scenario::next_tx(&mut scenario, user);

        // 4. Verify Position and Withdraw USDC
        {
            let mut vault = test_scenario::take_shared<Vault<USDC>>(&scenario);
            let config = test_scenario::take_shared<ProtocolConfig>(&scenario);
            let position = test_scenario::take_from_sender<UserPosition>(&scenario);

            assert!(position::shares(&position) == 1000000, 1);

            // Test generic withdraw entry function
            vault_entry::withdraw<USDC>(&mut vault, &config, position, test_scenario::ctx(&mut scenario));

            test_scenario::return_shared(vault);
            test_scenario::return_shared(config);
        };

        test_scenario::next_tx(&mut scenario, user);

        // 5. Verify received coin
        {
            let coin = test_scenario::take_from_sender<Coin<USDC>>(&scenario);
            assert!(coin::value(&coin) == 1000000, 2);
            test_scenario::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
