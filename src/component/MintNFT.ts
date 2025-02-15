"use client";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { toast } from 'sonner';
import { walletAdapterIdentity } from "@metaplex-foundation/js";
import { SystemProgram } from "@solana/web3.js";


const COLLECTION_NAME = "ZkAGI Community Mints";

const uploadToPinata = async (base64Image: string, address: string) => {
  const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error("Pinata API keys are not defined");
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

  try {
    // Upload image
    const imageResult = await fetch(url, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      },
      body: formData
    });
    const imageData = await imageResult.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    // Create metadata
    const metadata = {
      name: name, // Use the provided name parameter instead of collection name
      description: "ZkAGI Community NFT",
      image: imageUrl,
      attributes: [
        {
          trait_type: "NFT type",
          value: "ImageGenNft"
        },
        {
          trait_type: "Stamp",
          value: "ZkAGI"
        }
      ],
      properties: {
        files: [{ uri: imageUrl, type: "image/png" }],
        category: "image",
        creators: [{ address, share: 100 }]
      }
    };

    // Upload metadata
    const metadataResult = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    const metadataData = await metadataResult.json();
    return metadataData.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    // Additional log in the catch block
    console.log("Caught error in uploadToPinata:", error);
    throw error;
  }
};

const fetchOrCreateCollection = async (metaplex: Metaplex) => {
  try {
    // Log current Metaplex identity
    console.log("Current Metaplex identity public key:", metaplex.identity().publicKey.toBase58());

    // Find existing collection NFTs
    const myNfts = await metaplex.nfts().findAllByOwner({
      owner: metaplex.identity().publicKey,
    });

    const collectionNft = myNfts.find(
      nft => nft.name === COLLECTION_NAME && nft.collectionDetails
    );

    if (collectionNft) {
      console.log("Found existing collection:", collectionNft.address.toBase58());
      return collectionNft;
    }

    // Create new collection NFT if none exists
    console.log("Creating new collection...");
    const { nft: newCollectionNft } = await metaplex.nfts().create({
      name: COLLECTION_NAME,
      uri: "https://gateway.pinata.cloud/ipfs/bafkreih66ep3bwfogf3qet7u7u3j5q7v5ci23qbxppvyjjegzmatn6vw4y",
      sellerFeeBasisPoints: 0,
      isCollection: true,
      // updateAuthority defaults to metaplex.identity()
    });

    console.log("Created new collection:", newCollectionNft.address.toBase58());
    return newCollectionNft;
  } catch (error) {
    console.error("Error in fetchOrCreateCollection:", error);
    console.log("Caught error in fetchOrCreateCollection:", error);
    throw error;
  }
};

const CreateNft = async (base64Image: string, name: string, wallet: any) => {
  if (!wallet.publicKey || !wallet.connected) {
    toast.error("Please connect your wallet first");
    return;
  }
  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || "");
    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

    const uriHash = await uploadToPinata(base64Image, wallet.publicKey.toBase58());
    const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;
    console.log("Starting NFT mint...");

    // Call the backend API
    const response = await fetch("/api/mintNFT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadataUri: uri,
        nftName: name,
        userPublicKey: wallet.publicKey.toBase58(),
      }),
    });

    const { transaction: serializedTx } = await response.json();
    const txBuffer = Buffer.from(serializedTx, "base64");
    const transaction = Transaction.from(txBuffer);

    // Have the user wallet sign the transaction
    const signedTx = await wallet.signTransaction(transaction);
    // Send the fully signed transaction to Solana
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    console.log("NFT minted successfully:", txId);
    toast.success("NFT minted successfully!");
    return txId;

  } catch (error: any) {
    console.error("Error minting NFT:", error);
    toast.error("Failed to mint NFT: " + error.message);
    throw error;
  }
};




export default CreateNft;