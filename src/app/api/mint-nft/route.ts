import { NextResponse } from "next/server";
import { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

// Lazy-loaded agent to avoid build-time errors
let _agent: SolanaAgentKit | null = null;
function getAgent() {
  if (_agent) return _agent;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
  const centralWalletSecret = process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET;
  if (!centralWalletSecret) {
    throw new Error("CENTRAL_WALLET_SECRET is not defined.");
  }
  if (!rpcUrl) {
    throw new Error("rpcUrls are not defined");
  }
  _agent = new SolanaAgentKit(centralWalletSecret, rpcUrl, {
    OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || undefined,
  });
  return _agent;
}

// Helper function: Upload image and metadata to Pinata
const uploadToPinata = async (base64Image: string, address: string) => {
  const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error("Pinata API keys are not defined. Please check your environment variables.");
  }

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  };
  const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const blob = base64ToBlob(base64Image, contentType);
  const formData = new FormData();
  formData.append('file', blob, 'image.png');
  const options = {
    method: 'POST',
    headers: {
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecretApiKey
    },
    body: formData
  };

  try {
    const result = await fetch(url, options);
    const imageData = await result.json();
    console.log('Pinata image response:', imageData);

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
    console.log("imageUrl is ", imageUrl);

    const metadata = {
      "attributes": [
        {
          "trait_type": "NFT type",
          "value": "ImageGenNft"
        },
        {
          "trait_type": "Stamp",
          "value": "ZkAGI"
        }

      ],
      "collection": {
        "name": "ZkAGI Community Mints",
        "family": "ImageGenNft",
      },
      "properties": {
        "files": [
          {
            "uri": imageUrl,
            "type": "image/png",
          },
        ],
        "category": "image",
        "maxSupply": 0,
        "creators": [
          {
            "address": address,
            "share": 100,
          },
        ],
      },
      "image": imageUrl,
    };

    const metadataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const metadataOptions = {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    };

    const metadataResult = await fetch(metadataUrl, metadataOptions);
    const metadataData = await metadataResult.json();
    console.log('Pinata metadata response:', metadataData);

    return metadataData.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
  }
};

// Deploy collection
async function deployCollection(): Promise<PublicKey> {
  const collection = await getAgent().deployCollection({
    name: "ZkAGI Community Mints",
    uri: "https://gateway.pinata.cloud/ipfs/your-collection-uri",
    royaltyBasisPoints: 500,
  });
  return collection.collectionAddress;
}

// NFT creation function
async function createNft(
  base64Image: string,
  name: string,
  recipient: string
): Promise<string> {
  // Deploy the collection
  const collectionAddress = await deployCollection();

  // Upload image and metadata to Pinata
  const uriHash = await uploadToPinata(base64Image, recipient);
  const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

  // Convert recipient to PublicKey and mint NFT
  const recipientPubkey = new PublicKey(recipient);
  const nft = await getAgent().mintNFT(collectionAddress, { name, uri }, recipientPubkey);
  return nft.mint.toString();
}

// The POST handler for this route
export async function POST(request: Request) {
  try {
    // Parse JSON body
    const { base64Image, name, recipient } = await request.json();
    if (!base64Image || !name || !recipient) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const mintAddress = await createNft(base64Image, name, recipient);
    return NextResponse.json({ mintAddress }, { status: 200 });
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}