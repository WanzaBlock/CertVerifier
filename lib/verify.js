import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./contract";

function getProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) throw new Error("NEXT_PUBLIC_RPC_URL is not set");
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Accepts a plain cert ID (e.g. "CERT-001") or a raw bytes32 hex hash.
 * Returns verification result from the contract.
 */
export async function verifyCertificate(input) {
  const provider = getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  let certHash;
  const trimmed = input.trim();

  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
    // Already a valid bytes32 hex
    certHash = trimmed;
  } else {
    // Hash the plain ID
    certHash = ethers.keccak256(ethers.toUtf8Bytes(trimmed));
  }

  const [valid, recipientName, course, institution, issuedAt, revoked] =
    await contract.verifyCertificate(certHash);

  return {
    valid,
    recipientName,
    course,
    institution,
    issuedAt: issuedAt > 0n
      ? new Date(Number(issuedAt) * 1000).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null,
    revoked,
    certHash,
  };
}

/**
 * Fetch contract-level stats (total issued / revoked).
 */
export async function getStats() {
  const provider = getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const [issued, revoked] = await Promise.all([
    contract.totalIssued(),
    contract.totalRevoked(),
  ]);
  return {
    issued: Number(issued),
    revoked: Number(revoked),
  };
}
