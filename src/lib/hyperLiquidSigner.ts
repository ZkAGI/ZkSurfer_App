// src/lib/hyperliquidSigner.ts
import { Wallet, TypedDataDomain, TypedDataField } from 'ethers';

// ---- ENV ----
// PRIVATE_KEY: Server-only - do NOT use NEXT_PUBLIC_ prefix
// SIGNATURE_CHAIN_ID: hex id of the chain you sign on (Arbitrum = 0xa4b1)
// HYPERLIQ_CHAIN: "Testnet" or "Mainnet"
// Note: Environment variables are validated at runtime, not at module load time

let _wallet: Wallet | null = null;

function getWallet(): Wallet {
    if (_wallet) return _wallet;

    // Use server-only env var (HL_PRIVATE_KEY instead of NEXT_PUBLIC_HL_PRIVATE_KEY)
    const PRIVATE_KEY = process.env.HL_PRIVATE_KEY;

    if (!PRIVATE_KEY) {
        throw new Error('Missing HL_PRIVATE_KEY in env');
    }

    _wallet = new Wallet(PRIVATE_KEY);
    return _wallet;
}

const SIGNATURE_CHAIN_ID = process.env.NEXT_PUBLIC_HL_SIGNATURE_CHAIN_ID ?? '0xa4b1';
const HYPERLIQ_CHAIN = process.env.NEXT_PUBLIC_HL_CHAIN ?? 'Testnet';

/**
 * Canonicalize payload like Hyperliquid Python SDK does:
 *   { action, nonce, vaultAddress?, expiresAfter? }
 * We embed hyperliquidChain + signatureChainId when required by some actions.
 */
export async function signAction(params: {
    action: any;
    nonce: number;
    vaultAddress?: string;
    expiresAfter?: number;
    hyperliquidChain?: 'Testnet' | 'Mainnet';
    signatureChainId?: string; // hex
}) {
    const {
        action,
        nonce,
        vaultAddress,
        expiresAfter,
        hyperliquidChain = HYPERLIQ_CHAIN as 'Testnet' | 'Mainnet',
        signatureChainId = SIGNATURE_CHAIN_ID,
    } = params;

    // 1) Build the outer payload exactly like the REST body (minus signature)
    const payload: any = { action, nonce };
    if (vaultAddress) payload.vaultAddress = vaultAddress;
    if (expiresAfter) payload.expiresAfter = expiresAfter;
    if (action.hyperliquidChain || /Send|withdraw3|approve/i.test(action.type)) {
        // Some actions require these fields *inside* action, others outside.
        // We add them here if not present.
        payload.action.hyperliquidChain ??= hyperliquidChain;
        payload.action.signatureChainId ??= signatureChainId;
    }

    /**
     * 2) Hyperliquid uses a simple EIP-191 personal_sign over the deterministic JSON string.
     * If you use their Python SDK, it's: sign( keccak256(json.dumps(payload, separators=(',', ':'), sort_keys=True)) )
     */
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    // ethers v6: signMessage does EIP-191 \x19Ethereum Signed Message prefix automatically
    const wallet = getWallet();
    const signature = await wallet.signMessage(canonical);

    return {
        signature,
        // You usually also include your address + chainId
        address: wallet.address,
        hyperliquidChain,
        signatureChainId,
    };
}

// import 'server-only';
// import { Wallet, utils } from 'ethers'; // ethers v5
// const { keccak256, toUtf8Bytes } = utils;

// const PK = process.env.HL_PRIVATE_KEY;
// if (!PK) throw new Error('HL_PRIVATE_KEY is missing');

// const wallet = new Wallet(PK);

// function canonical(obj: any) {
//   return JSON.stringify(obj, Object.keys(obj).sort());
// }

// type SignArgs = {
//   action: any;
//   nonce: number;
//   vaultAddress?: string;
//   expiresAfter?: number;
// };

// export function signAction({ action, nonce, vaultAddress, expiresAfter }: SignArgs) {
//   const payload: any = { action, nonce };
//   if (vaultAddress)  payload.vaultAddress = vaultAddress;
//   if (expiresAfter)  payload.expiresAfter = expiresAfter;

//   const msg    = canonical(payload);
//   const digest = keccak256(toUtf8Bytes(msg));                 // 0x… hash
//   const sig    = wallet._signingKey().signDigest(digest);     // { r, s, v }

//   return { r: sig.r, s: sig.s, v: sig.v };
// }
