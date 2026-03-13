// ─── Update CONTRACT_ADDRESS after deploying to Sepolia ───────────────────────
export const CONTRACT_ADDRESS = "0xb4B1dbBC4bC03FE122b7f973cBAa9651b3c232Eb";

export const NETWORK = {
  name: "Base Sepolia",
  chainId: 84532,
  explorer: "https://sepolia.basescan.org",
};

export const ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalIssued",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRevoked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "certHash", type: "bytes32" },
    ],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "valid", type: "bool" },
      { internalType: "string", name: "recipientName", type: "string" },
      { internalType: "string", name: "course", type: "string" },
      { internalType: "string", name: "institution", type: "string" },
      { internalType: "uint256", name: "issuedAt", type: "uint256" },
      { internalType: "bool", name: "revoked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "certHash", type: "bytes32" },
      { internalType: "string", name: "recipientName", type: "string" },
      { internalType: "string", name: "course", type: "string" },
      { internalType: "string", name: "institution", type: "string" },
    ],
    name: "issueCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "certHash", type: "bytes32" },
    ],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
