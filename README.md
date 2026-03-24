# CertVerifier — On-Chain Certificate Verification

A full-stack dApp that issues and verifies academic or professional certificates on Base. Built with Solidity (Foundry) and Next.js. Deployable on Vercel with no backend required.

**Live app:** https://onchaincert.vercel.app/

**Live contract:** `0x4c23c252EDeb0844F2BB2B2dE208d6764C05739B`
**Network:** Base Sepolia (chainId 84532)
**Explorer:** https://sepolia.basescan.org/address/0x4c23c252EDeb0844F2BB2B2dE208d6764C05739B

---

## Project Structure

```
cert-verifier/
├── contract/               ← Solidity smart contract (Foundry)
│   ├── src/CertVerifier.sol
│   ├── test/CertVerifier.t.sol
│   ├── script/Deploy.s.sol
│   └── foundry.toml
└── frontend/               ← Next.js frontend
    ├── app/
    │   ├── page.js
    │   ├── page.module.css
    │   ├── layout.js
    │   └── globals.css
    ├── lib/
    │   ├── contract.js     ← ABI + contract address
    │   └── verify.js       ← ethers.js logic
    └── vercel.json
```

---

## Phase 1 — Smart Contract

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Base Sepolia ETH in your wallet — get it free at https://faucet.quicknode.com/base/sepolia
- Alchemy or Infura RPC URL pointed at Base Sepolia

### Setup

```bash
cd contract
git init && git add . && git commit -m "init"
forge install foundry-rs/forge-std --no-commit
cp .env.example .env
# Fill in your Base Sepolia RPC URL in .env
```

### Run tests

```bash
forge test -vv
```

### Deploy

```bash
# Create encrypted keystore (one time)
cast wallet import deployer --interactive

# Deploy to Base Sepolia
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/YOUR_KEY \
  --account deployer \
  --broadcast
```

Copy the deployed contract address from the output and update `frontend/lib/contract.js`.

---

## Phase 2 — Issue a Certificate

```bash
# Step 1: get the bytes32 hash of your cert ID
cast keccak "CERT-001"

# Step 2: issue the certificate
cast send 0xb4B1dbBC4bC03FE122b7f973cBAa9651b3c232Eb \
  "issueCertificate(bytes32,string,string,string)" \
  <CERT_HASH> "Recipient Name" "Course Name" "Institution" \
  --account deployer \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

---

## Phase 3 — Frontend

### Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Set your RPC URL in `.env.local`:
```
NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

Update `lib/contract.js` with your deployed contract address.

### Run locally

```bash
npm run dev
```

Open http://localhost:3000, type `CERT-001`, and click Verify.

---

## Phase 4 — Deploy to Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Set root directory to `frontend` if needed
4. Add environment variable: `NEXT_PUBLIC_RPC_URL`
5. Deploy

---

## How Verification Works

| Input | What happens |
|---|---|
| Plain ID e.g. `CERT-001` | App hashes it with `keccak256` and queries the contract |
| Raw hash e.g. `0xabc...` | Sent directly to the contract |

The contract returns: validity, recipient name, course, institution, issue date, and revocation status. All read-only — no wallet connection needed for verification.

---

## Contract Functions

| Function | Access | Description |
|---|---|---|
| `issueCertificate` | Owner only | Register a new certificate |
| `verifyCertificate` | Public | Check if a certificate is valid |
| `revokeCertificate` | Owner only | Mark a certificate as revoked |
| `transferOwnership` | Owner only | Hand over contract control |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Smart contract | Solidity 0.8.20 + Foundry |
| Network | Base Sepolia |
| Frontend | Next.js 14 + ethers.js v6 |
| Hosting | Vercel |
| Backend | None |