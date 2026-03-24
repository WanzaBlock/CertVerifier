// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title CertVerifier
/// @notice Issues and verifies academic or professional certificates on-chain
contract CertVerifier {
    address public owner;

    struct Certificate {
        string recipientName;
        string course;
        string institution;
        uint256 issuedAt;
        bool exists;
        bool revoked;
    }

    mapping(bytes32 => Certificate) private certificates;
    uint256 public totalIssued;
    uint256 public totalRevoked;

    event CertificateIssued(
        bytes32 indexed certHash,
        string recipientName,
        string course,
        string institution
    );
    event CertificateRevoked(bytes32 indexed certHash);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error AlreadyIssued();
    error NotFound();
    error AlreadyRevoked();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        bytes32 certHash,
        string calldata recipientName,
        string calldata course,
        string calldata institution
    ) external onlyOwner {
        if (certificates[certHash].exists) revert AlreadyIssued();
        certificates[certHash] = Certificate({
            recipientName: recipientName,
            course: course,
            institution: institution,
            issuedAt: block.timestamp,
            exists: true,
            revoked: false
        });
        totalIssued++;
        emit CertificateIssued(certHash, recipientName, course, institution);
    }

    function verifyCertificate(bytes32 certHash)
        external
        view
        returns (
            bool valid,
            string memory recipientName,
            string memory course,
            string memory institution,
            uint256 issuedAt,
            bool revoked
        )
    {
        Certificate memory cert = certificates[certHash];
        return (
            cert.exists && !cert.revoked,
            cert.recipientName,
            cert.course,
            cert.institution,
            cert.issuedAt,
            cert.revoked
        );
    }

    function revokeCertificate(bytes32 certHash) external onlyOwner {
        if (!certificates[certHash].exists) revert NotFound();
        if (certificates[certHash].revoked) revert AlreadyRevoked();
        certificates[certHash].revoked = true;
        totalRevoked++;
        emit CertificateRevoked(certHash);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
