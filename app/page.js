"use client";

import { useState, useEffect, useRef } from "react";
import { verifyCertificate, getStats } from "../lib/verify";
import { NETWORK, CONTRACT_ADDRESS } from "../lib/contract";
import styles from "./page.module.css";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    valid: { label: "VALID", cls: styles.badgeValid },
    revoked: { label: "REVOKED", cls: styles.badgeRevoked },
    notfound: { label: "NOT FOUND", cls: styles.badgeNotFound },
  };
  const { label, cls } = map[status];
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result }) {
  const status = result.valid ? "valid" : result.revoked ? "revoked" : "notfound";

  return (
    <div className={`${styles.resultCard} ${styles[`result_${status}`]}`}>
      <div className={styles.resultHeader}>
        <StatusBadge status={status} />
        <span className={styles.resultTimestamp}>
          {result.valid
            ? `Issued ${result.issuedAt}`
            : result.revoked
            ? "This certificate was revoked"
            : "No record found on-chain"}
        </span>
      </div>

      {(result.valid || result.revoked) && result.recipientName && (
        <div className={styles.resultBody}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Recipient</span>
            <span className={styles.resultValue}>{result.recipientName}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Course</span>
            <span className={styles.resultValue}>{result.course}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Institution</span>
            <span className={styles.resultValue}>{result.institution}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Hash</span>
            <span className={`${styles.resultValue} ${styles.mono}`}>
              {result.certHash.slice(0, 18)}…{result.certHash.slice(-6)}
            </span>
          </div>
        </div>
      )}

      {!result.valid && !result.revoked && (
        <p className={styles.resultHint}>
          Double-check the certificate ID or hash. If you believe this is an
          error, contact the issuing institution.
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {}); // stats are cosmetic — fail silently
  }, []);

  async function handleVerify() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const data = await verifyCertificate(trimmed);
      setResult(data);
    } catch (err) {
      if (err.message?.includes("NEXT_PUBLIC_RPC_URL")) {
        setError("RPC URL is not configured. Set NEXT_PUBLIC_RPC_URL in your environment.");
      } else if (err.code === "NETWORK_ERROR" || err.message?.includes("network")) {
        setError("Could not connect to the network. Check your RPC URL.");
      } else {
        setError("Verification failed. Check the ID and try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleVerify();
  }

  function handleClear() {
    setInput("");
    setResult(null);
    setError("");
    inputRef.current?.focus();
  }

  function copyAddress() {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPlaceholder =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <main className={styles.main}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◆</span>
            <span className={styles.logoText}>CertVerifier</span>
          </div>
          <div className={styles.networkTag}>
            <span className={styles.networkDot} />
            {NETWORK.name}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>On-Chain Verification</div>
          <h1 className={styles.headline}>
            Verify any certificate.<br />
            <span className={styles.accentText}>Trustlessly.</span>
          </h1>
          <p className={styles.subtext}>
            Certificates issued on this registry are stored on Base Sepolia and
            cannot be forged or altered. Enter an ID or hash below to confirm
            authenticity.
          </p>
        </div>
      </section>

      {/* ── Search ── */}
      <section className={styles.searchSection}>
        <div className={styles.searchBox}>
          {isPlaceholder && (
            <div className={styles.devNotice}>
              <span className={styles.devIcon}>⚠</span>
              Contract address not set. Update{" "}
              <code>lib/contract.js</code> after deploying.
            </div>
          )}

          <label className={styles.inputLabel} htmlFor="certInput">
            Certificate ID or Hash
          </label>

          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              id="certInput"
              type="text"
              className={styles.input}
              placeholder="e.g. CERT-001 or 0xabc123…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
            {input && (
              <button
                className={styles.clearBtn}
                onClick={handleClear}
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.inputHint}>
            Plain IDs like <span className={styles.mono}>CERT-001</span> are
            accepted — the app converts them automatically.
          </div>

          <button
            className={styles.verifyBtn}
            onClick={handleVerify}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              "Verify Certificate"
            )}
          </button>
        </div>

        {error && (
          <div className={styles.errorMsg}>
            <span>⚠</span> {error}
          </div>
        )}

        {result && <ResultCard result={result} />}
      </section>

      {/* ── Stats ── */}
      {stats && (
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.issued}</span>
              <span className={styles.statLabel}>Certificates Issued</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.revoked}</span>
              <span className={styles.statLabel}>Revoked</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.issued - stats.revoked}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.contractInfo}>
            <span className={styles.footerLabel}>Contract</span>
            <button className={styles.addressBtn} onClick={copyAddress}>
              <span className={styles.mono}>
                {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-8)}
              </span>
              <span className={styles.copyHint}>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <a
            href={`${NETWORK.explorer}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.explorerLink}
          >
            View on {NETWORK.name} Explorer ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
