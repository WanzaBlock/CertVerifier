// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CertVerifier.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        CertVerifier verifier = new CertVerifier();

        console.log("CertVerifier deployed at:", address(verifier));
        console.log("Owner:", verifier.owner());

        vm.stopBroadcast();
    }
}
