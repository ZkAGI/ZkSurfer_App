# ZkTerminal

**AI-Powered Web3 Command Terminal for Solana**

ZkTerminal is a unified command interface that combines AI agents, zero-knowledge privacy, video/voice generation, crypto trading, and token launching — all from a single terminal.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Solana](https://img.shields.io/badge/Solana-Web3-9945FF?logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## Features

### AI Agents & Swarms
- **Agent Swarms** — Create and deploy autonomous AGI swarms for business automation
- **Video Agent** — Generate AI videos with custom voices, styles, and formats (16:9 / 9:16)
- **Voice Agent** — Voice cloning, text-to-speech, and batch audio processing
- **Prediction Agent** — AI-powered crypto market predictions with HyperLiquid trading integration

### Privacy & Zero-Knowledge Proofs
- **ZK Proof Generation** — Create privacy-preserving proofs from documents (PDF/DOC/TXT)
- **Privacy AI** — Query encrypted knowledge bases without exposing raw data
- **Medical Proofs** — Specialized ZK proofs for medical data with verification

### Trading & DeFi
- **HyperLiquid Integration** — Perpetual futures trading with AI signals, margin management, and P&L tracking
- **Market Predictions** — Daily BTC/ETH/SOL predictions with sentiment analysis and confidence intervals
- **Solana Pay** — USDC payments on Solana

### Token & NFT Tools
- **Memecoin Launchpad** — Create and launch tokens with agent personalities, training data, and social integrations
- **NFT Minting** — Generate images and mint them as NFTs directly from the terminal
- **Marketplace** — AI coin trading platform with real-time pricing and leaderboards

### Media Generation
- `/video-gen` — Generate videos from text prompts
- `/image-gen` — Generate images with optional ticker overlays
- Voice cloning and lip-sync generation

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS, Framer Motion, Radix UI |
| **Blockchain** | Solana (web3.js, wallet-adapter), Ethereum (ethers, wagmi, viem), HyperLiquid |
| **Wallets** | Phantom, Dynamic Labs, Privy, Magic, RainbowKit |
| **AI/ML** | OpenAI, DeepSeek, Mistral, Xenova Transformers, MCP SDK |
| **State** | Zustand, TanStack React Query, SWR |
| **Auth** | NextAuth |
| **Payments** | Stripe, Solana Pay |
| **Media** | FFmpeg, Sharp, Canvas |
| **Storage** | Vercel Blob, Pinata (IPFS) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- A Solana wallet (Phantom recommended)

### Installation

```bash
git clone https://github.com/ZkAGI/ZkSurfer_App.git
cd ZkSurfer_App
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# LLM Configuration
NEXT_PUBLIC_DEEPSEEK_BASE_URL=
NEXT_PUBLIC_DEEPSEEK_MODEL=
NEXT_PUBLIC_OPENAI_BASE_URL=
NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_MISTRAL_MODEL=

# Solana
NEXT_PUBLIC_RPC_ENDPOINT=
NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS=
NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS=

# Video & Voice
NEXT_PUBLIC_VIDEO_GEN_ENDPOINT=
NEXT_PUBLIC_VOICE_CLONE=
NEXT_PUBLIC_VIDEO_LIPSYNC=

# Predictions
NEXT_PUBLIC_PREDICTION_API=
NEXT_PUBLIC_PAST_PREDICTION_API=

# HyperLiquid Trading
NEXT_PUBLIC_HL_USER_WALLET=
NEXT_PUBLIC_HL_MAIN_WALLET=
HL_PRIVATE_KEY=

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URI=

# Storage
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_API_SECRET=
BLOB_READ_WRITE_TOKEN=

# API
NEXT_PUBLIC_API_KEY=
DATABASE_API_URL=
DATABASE_API_KEY=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `/swarm` | Create an autonomous AI agent swarm |
| `/video-gen <prompt>` | Generate a video from a text prompt |
| `/image-gen <prompt>` | Generate an image |
| `/zk-prove` | Create a zero-knowledge proof |
| `/analyze` | Run market analysis |
| `/mint` | Mint generated content as an NFT |
| `/api` | Generate or view your Zynapse API key |
| `/generate-private` | Upload files and generate ZK-proof JSON |
| `/privacy-ai` | Query a ZK-proof with a question |
| `/medical-proof-create` | Create a private medical knowledge base |
| `/medical-proof-verify` | Verify a medical ZK proof |

---

## Project Structure

```
src/
├── app/
│   ├── [lang]/              # i18n routing
│   │   ├── home/            # Main terminal dashboard
│   │   ├── marketplace/     # Token trading marketplace
│   │   ├── memelaunch/      # Memecoin creator
│   │   ├── predictions/     # Prediction dashboard
│   │   └── payments/        # Subscription management
│   └── api/
│       ├── video-gen/       # Video generation (async job system)
│       ├── video-agent/     # Video agent endpoints
│       ├── voice-clone/     # Voice cloning
│       ├── hl/              # HyperLiquid trading
│       ├── kb/              # Knowledge base management
│       ├── privacy-ai/      # Privacy-preserving AI queries
│       ├── chat/            # Chat endpoints
│       └── auth/            # NextAuth
├── component/
│   ├── ZkTerminal/          # Core terminal interface
│   ├── ui/                  # UI components (modals, charts, cards)
│   ├── agent/               # Agent creation forms
│   └── chat/                # Chat interface
├── stores/                  # Zustand state stores
├── lib/                     # Utilities (HyperLiquid client, Solana Pay, etc.)
├── services/                # External service clients
└── types/                   # TypeScript definitions
```

---

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` triggers automatic deployment.

```bash
# Vercel CLI
npx vercel --prod
```

The video generation API uses an async job/polling pattern to stay within Vercel's serverless function timeout limits (300s max on Pro).

---

## Architecture Notes

- **Terminal-First UI** — All features are accessible via slash commands in ZkTerminal
- **Multi-Chain** — Solana-native with EVM support via wagmi/viem
- **Async Video Gen** — POST returns a `jobId`, frontend polls GET until the video blob is ready
- **ZK Privacy** — Documents are processed into zero-knowledge proofs, enabling AI queries without exposing raw data
- **Agent Swarms** — Multi-agent systems that can be composed and deployed for autonomous tasks
- **i18n** — Internationalization via `[lang]` route segments

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

Proprietary. All rights reserved by ZkAGI.

---

Built by [ZkAGI](https://zkagi.ai)
