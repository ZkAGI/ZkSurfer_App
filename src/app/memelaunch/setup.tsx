import { AnchorProvider, setProvider, Program, Idl } from "@coral-xyz/anchor";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";
import { Console } from "console";

interface TokenCreationData {
  name: string;
  ticker: string;
  description: string;
  imageBase64: string;
}

const uploadToPinata = async (base64Image: string, tokenData: TokenCreationData) => {
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

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

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      },
      body: formData
    });

    const imageData = await result.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    const metadata = {
      "name": tokenData.name,
      "symbol": tokenData.ticker,
      "description": tokenData.description,
      "image": imageUrl
    };

    const metadataResult = await fetch(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, {
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
    throw error;
  }
};
const TokenCreator = async ({ wallet, tokenData }: { wallet: AnchorWallet; tokenData: TokenCreationData }) => {

  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim() || "";
  const pId = process.env.NEXT_PUBLIC_PMP_PROGRAM_ID || "";
  const connection = new Connection(rpcEndpoint, "confirmed");
  const programId = new PublicKey(pId);

  const getMintAddress = (tokenName: string): PublicKey => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(tokenName)],
      programId
    )[0];
  };

  const createToken = async () => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    const metadataUri = await uploadToPinata(tokenData.imageBase64, tokenData);
    const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
    console.log('uri is', uri)

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    setProvider(provider);

    const program = new Program(idl as unknown as Idl, programId, provider);
    console.log('program', program)
    if (!program) {
      throw new Error("Program is undefined");
    }

    const tokenDetails = {
      name: tokenData.name,
      symbol: tokenData.ticker,
      uri: uri,
    };

    const metadataTokenProgramPubkey = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const platformKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    )[0];

    const mintKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(tokenDetails.name)],
      program.programId
    )[0];

    const metadataKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        metadataTokenProgramPubkey.toBuffer(),
        mintKeypair.toBuffer(),
      ],
      metadataTokenProgramPubkey
    )[0];

    const tokenInfoKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token"), Buffer.from(tokenDetails.name)],
      program.programId
    )[0];

    const escrowTokenAccountKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token_account"), mintKeypair.toBuffer()],
      program.programId
    )[0];

    try {
      await program.methods.createToken(tokenDetails).accounts({
        metadata: metadataKeypair.toBase58(),
        platform: platformKeypair.toBase58(),
        mint: mintKeypair.toBase58(),
        tokenAccount: escrowTokenAccountKeypair.toBase58(),
        tokenInfo: tokenInfoKeypair.toBase58(),
        tokenMetadataProgram: metadataTokenProgramPubkey.toBase58(),
      }).rpc();
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  };

  return {
    createToken,
    getMintAddress
  };
};


export default TokenCreator;