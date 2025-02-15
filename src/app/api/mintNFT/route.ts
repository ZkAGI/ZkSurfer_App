import { NextResponse } from "next/server";
import { Connection, Keypair, Transaction, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import bs58 from 'bs58';

function loadCentralKeypair(): Keypair {
  const base58Secret = process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET;
  if (!base58Secret) {
    throw new Error("Central wallet secret is not defined in environment variables.");
  }

  try {
    const secretKey = bs58.decode(base58Secret);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error("Key parsing error:", error);
    throw new Error("Failed to parse central wallet secret. Ensure it's a valid base58 string.");
  }
}

export async function POST(request: Request) {
  try {
    // Input validation
    const body = await request.json();
    const { metadataUri, nftName, userPublicKey } = body;

    if (!metadataUri || typeof metadataUri !== 'string') {
      return NextResponse.json({ error: "Invalid or missing metadataUri" }, { status: 400 });
    }
    if (!nftName || typeof nftName !== 'string') {
      return NextResponse.json({ error: "Invalid or missing nftName" }, { status: 400 });
    }
    if (!userPublicKey || typeof userPublicKey !== 'string') {
      return NextResponse.json({ error: "Invalid or missing userPublicKey" }, { status: 400 });
    }

    // Validate RPC endpoint
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
    if (!rpcEndpoint) {
      throw new Error("RPC endpoint is not defined in environment variables.");
    }

    // Set up connection with retry logic
    const connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    });

    // Load central authority
    const centralAuthority = loadCentralKeypair();
    console.log("Central authority public key:", centralAuthority.publicKey.toBase58());

    // Initialize Metaplex
    const metaplexCentral = Metaplex.make(connection).use(keypairIdentity(centralAuthority));

    // Fetch or create collection NFT
    async function fetchOrCreateCentralCollection() {
      const COLLECTION_NAME = "ZkAGI Community Mints";
      const COLLECTION_URI = "https://gateway.pinata.cloud/ipfs/bafkreih66ep3bwfogf3qet7u7u3j5q7v5ci23qbxppvyjjegzmatn6vw4y";

      try {
        const myNfts = await metaplexCentral.nfts().findAllByOwner({ owner: centralAuthority.publicKey });
        let collectionNft = myNfts.find(nft => nft.name === COLLECTION_NAME && nft.collectionDetails);

        if (!collectionNft) {
          console.log("Creating new collection NFT...");
          const { nft } = await metaplexCentral.nfts().create({
            name: COLLECTION_NAME,
            uri: COLLECTION_URI,
            sellerFeeBasisPoints: 0,
            isCollection: true,
          });
          collectionNft = nft;
          console.log("Collection NFT created:", nft.address.toBase58());
        }

        if (!collectionNft) {
          throw new Error("Failed to fetch or create collection NFT");
        }

        return collectionNft;
      } catch (error) {
        console.error("Collection NFT error:", error);
        throw new Error("Failed to handle collection NFT");
      }
    }

    const collectionNft = await fetchOrCreateCentralCollection();

    // Create new mint keypair
    const newMintKeypair = Keypair.generate();

    // Build NFT mint transaction
    const builder = await metaplexCentral.nfts().builders().create({
      uri: metadataUri,
      name: nftName,
      sellerFeeBasisPoints: 0,
      useNewMint: newMintKeypair,
      collection: collectionNft.address,
      updateAuthority: centralAuthority,
      collectionAuthority: centralAuthority,
      tokenOwner: new PublicKey(userPublicKey),
    });

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    // Build transaction
    const transaction = builder.toTransaction({
      blockhash,
      lastValidBlockHeight
    });

    if (!transaction) {
      throw new Error("Failed to create transaction");
    }

    // Set the fee payer
    transaction.feePayer = centralAuthority.publicKey;

    // Sign with central authority and new mint keypair
    transaction.partialSign(centralAuthority, newMintKeypair);

    // Serialize and return transaction
    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    }).toString('base64');

    return NextResponse.json({
      transaction: serializedTx,
      mint: newMintKeypair.publicKey.toBase58(),
    });

  } catch (error: any) {
    console.error("NFT mint error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during NFT mint" },
      { status: 500 }
    );
  }
}