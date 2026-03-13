// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CertVerifier.sol";

contract CertVerifierTest is Test {
    CertVerifier verifier;
    address owner;
    address stranger = address(0xBEEF);

    function setUp() public {
        owner = address(this);
        verifier = new CertVerifier();
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    function _hash(string memory id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(id));
    }

    function _issue(string memory id) internal {
        verifier.issueCertificate(
            _hash(id),
            "Samuel Mwanza",
            "Blockchain Security",
            "IT-ARMI"
        );
    }

    // ─── issue ───────────────────────────────────────────────────────────────

    function test_Issue_StoresCorrectData() public {
        _issue("CERT-001");

        (
            bool valid,
            string memory name,
            string memory course,
            string memory institution,
            uint256 issuedAt,
            bool revoked
        ) = verifier.verifyCertificate(_hash("CERT-001"));

        assertTrue(valid);
        assertEq(name, "Samuel Mwanza");
        assertEq(course, "Blockchain Security");
        assertEq(institution, "IT-ARMI");
        assertTrue(issuedAt > 0);
        assertFalse(revoked);
    }

    function test_Issue_IncrementsTotalIssued() public {
        _issue("CERT-001");
        _issue("CERT-002");
        assertEq(verifier.totalIssued(), 2);
    }

    function test_Issue_EmitsEvent() public {
        bytes32 h = _hash("CERT-001");
        vm.expectEmit(true, false, false, true);
        emit CertVerifier.CertificateIssued(h, "Samuel Mwanza", "Blockchain Security", "IT-ARMI");
        _issue("CERT-001");
    }

    function test_Issue_Reverts_IfDuplicate() public {
        _issue("CERT-001");
        vm.expectRevert(CertVerifier.AlreadyIssued.selector);
        _issue("CERT-001");
    }

    function test_Issue_Reverts_IfNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(CertVerifier.NotOwner.selector);
        verifier.issueCertificate(_hash("CERT-001"), "Alice", "DeFi", "UNAM");
    }

    // ─── verify ──────────────────────────────────────────────────────────────

    function test_Verify_ReturnsFalse_WhenNotFound() public view {
        (bool valid,,,,,) = verifier.verifyCertificate(_hash("GHOST"));
        assertFalse(valid);
    }

    // ─── revoke ──────────────────────────────────────────────────────────────

    function test_Revoke_MarksAsRevoked() public {
        _issue("CERT-001");
        verifier.revokeCertificate(_hash("CERT-001"));

        (bool valid,,,,, bool revoked) = verifier.verifyCertificate(_hash("CERT-001"));
        assertFalse(valid);
        assertTrue(revoked);
    }

    function test_Revoke_IncrementsTotalRevoked() public {
        _issue("CERT-001");
        verifier.revokeCertificate(_hash("CERT-001"));
        assertEq(verifier.totalRevoked(), 1);
    }

    function test_Revoke_Reverts_IfNotFound() public {
        vm.expectRevert(CertVerifier.NotFound.selector);
        verifier.revokeCertificate(_hash("GHOST"));
    }

    function test_Revoke_Reverts_IfAlreadyRevoked() public {
        _issue("CERT-001");
        verifier.revokeCertificate(_hash("CERT-001"));
        vm.expectRevert(CertVerifier.AlreadyRevoked.selector);
        verifier.revokeCertificate(_hash("CERT-001"));
    }

    function test_Revoke_Reverts_IfNotOwner() public {
        _issue("CERT-001");
        vm.prank(stranger);
        vm.expectRevert(CertVerifier.NotOwner.selector);
        verifier.revokeCertificate(_hash("CERT-001"));
    }

    // ─── ownership ───────────────────────────────────────────────────────────

    function test_TransferOwnership() public {
        verifier.transferOwnership(stranger);
        assertEq(verifier.owner(), stranger);
    }

    function test_TransferOwnership_Reverts_IfNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(CertVerifier.NotOwner.selector);
        verifier.transferOwnership(stranger);
    }
}
