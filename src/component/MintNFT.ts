// "use client";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
// import {
//     createNft,
//     mplTokenMetadata,
// } from "@metaplex-foundation/mpl-token-metadata";
// import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
// import bs58 from 'bs58';

// const uploadToPinata = async (base64Image: string, address: string) => {
//     const pinataApiKey = '687b32db4856209f2275';
//     const pinataSecretApiKey = '542f2768d67cd63fc4d2fb5f383d887717e6a05e9150fe0a941ae98e4a7e888a';
//     const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//     const base64ToBlob = (base64: string, contentType: string) => {
//         const byteCharacters = atob(base64.split(',')[1]);
//         const byteArrays = [];
//         for (let i = 0; i < byteCharacters.length; i++) {
//             byteArrays.push(byteCharacters.charCodeAt(i));
//         }
//         return new Blob([new Uint8Array(byteArrays)], { type: contentType });
//     };
//     const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
//     const blob = base64ToBlob(base64Image, contentType);
//     const formData = new FormData();
//     formData.append('file', blob, 'image.png');
//     const options = {
//         method: 'POST',
//         headers: {
//             'pinata_api_key': pinataApiKey,
//             'pinata_secret_api_key': pinataSecretApiKey
//         },
//         body: formData
//     };

//     try {
//         const result = await fetch(url, options);
//         const imageData = await result.json();
//         console.log('Pinata image response:', imageData);

//         const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
//         console.log("imageUrl is ", imageUrl);

//         const metadata = {
//             "attributes": [
//                 {
//                     "trait_type": "NFT type",
//                     "value": "ImageGenNft"
//                 },
//                 {
//                     "trait_type": "Stamp",
//                     "value": "ZkAGI"
//                 }

//             ],
//             "properties": {
//                 "files": [
//                     {
//                         "uri": imageUrl,
//                         "type": "image/png",
//                     },
//                 ],
//                 "category": "image",
//                 "maxSupply": 0,
//                 "creators": [
//                     {
//                         "address": address,
//                         "share": 100,
//                     },
//                 ],
//             },
//             "image": imageUrl,
//         };

//         const metadataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
//         const metadataOptions = {
//             method: 'POST',
//             headers: {
//                 'pinata_api_key': pinataApiKey,
//                 'pinata_secret_api_key': pinataSecretApiKey,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(metadata)
//         };

//         const metadataResult = await fetch(metadataUrl, metadataOptions);
//         const metadataData = await metadataResult.json();
//         console.log('Pinata metadata response:', metadataData);

//         return metadataData.IpfsHash;
//     } catch (error) {
//         console.error('Error uploading to Pinata:', error);
//     }
// };

// const CreateNft = async (base64Image: any, name: string, wallet: any) => {

//     const handleMint = async () => {

//         if (wallet.publicKey && wallet.connected) {
//             const umi = createUmi("https://devnet.helius-rpc.com/?api-key=daee1b98-f564-4352-b8aa-d41654bc0e02");
//             umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());
//             const address = wallet.publicKey?.toBase58();
//             console.log("address", address);
//             if (!address) {
//                 alert("Please connect your wallet to mint an NFT.");
//             }

//             try {
//                 const uriHash = await uploadToPinata(base64Image, address);
//                 const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;
//                 const { signature, result } = await createNft(umi, {
//                     mint: generateSigner(umi),
//                     name: name,
//                     uri: uri,
//                     updateAuthority: umi.identity.publicKey,
//                     sellerFeeBasisPoints: percentAmount(0),
//                 }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//                 const txSignature = bs58.encode(signature)
//                 console.log("NFT minted with signature:", txSignature, "Result:", result);
//                 console.log('hello')
//                 return txSignature
//             } catch (error) {
//                 console.error("Error minting NFT:", error);
//             }
//         } else {
//             alert("Please connect your wallet to mint an NFT.");
//         }
//     };

//     await handleMint();
// };


// export default CreateNft;


"use client";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
    createNft,
    findMasterEditionPda,
    findMetadataPda,
    mplTokenMetadata,
    verifyCollection,
} from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, KeypairSigner, percentAmount, TransactionBuilder } from "@metaplex-foundation/umi";
import bs58 from 'bs58';

const uploadToPinata = async (base64Image: string, address: string) => {
    const pinataApiKey = '687b32db4856209f2275';
    const pinataSecretApiKey = '542f2768d67cd63fc4d2fb5f383d887717e6a05e9150fe0a941ae98e4a7e888a';
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

// const CreateNft = async (base64Image: string, name: string, wallet: any) => {
//     const handleMint = async () => {
//         if (wallet.publicKey && wallet.connected) {
//             const umi = createUmi("https://devnet.helius-rpc.com/?api-key=daee1b98-f564-4352-b8aa-d41654bc0e02");
//             umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

//             const userPublicKey = wallet.publicKey.toBase58();
//             try {
//                 // Create signers for both NFTs
//                 const collectionMint = generateSigner(umi);
//                 const nftMint = generateSigner(umi);

//                 // Upload NFT Metadata to Pinata
//                 const uriHash = await uploadToPinata(base64Image, userPublicKey);
//                 const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

//                 // Create a transaction builder
//                 let builder = new TransactionBuilder();

//                 // Add collection creation instruction
//                 const collectionNftTx = createNft(umi, {
//                     mint: collectionMint,
//                     name: "ZK Collection",
//                     symbol: "ZKC",
//                     uri: "https://gateway.pinata.cloud/ipfs/ZK_COLLECTION_METADATA_URI",
//                     sellerFeeBasisPoints: percentAmount(0),
//                     isCollection: true,
//                     updateAuthority: umi.identity,
//                 });
//                 builder = builder.add(collectionNftTx);

//                 // Add NFT creation instruction
//                 const nftMetadata = findMetadataPda(umi, { mint: nftMint.publicKey });
//                 const collectionMetadata = findMetadataPda(umi, { mint: collectionMint.publicKey });
//                 const collectionMasterEdition = findMasterEditionPda(umi, { mint: collectionMint.publicKey });

//                 const nftTx = createNft(umi, {
//                     mint: nftMint,
//                     name,
//                     uri,
//                     sellerFeeBasisPoints: percentAmount(0),
//                     updateAuthority: umi.identity,
//                     collection: {
//                         verified: false,
//                         key: collectionMint.publicKey,
//                     },
//                 });
//                 builder = builder.add(nftTx);

//                 // Add collection verification instruction
//                 const verifyTx = verifyCollection(umi, {
//                     metadata: nftMetadata,
//                     collectionAuthority: umi.identity,
//                     collectionMint: collectionMint.publicKey,
//                     collection: collectionMetadata,
//                     collectionMasterEditionAccount: collectionMasterEdition,
//                 });
//                 builder = builder.add(verifyTx);

//                 // Send and confirm all transactions in one batch
//                 const result = await builder.sendAndConfirm(umi, {
//                     send: { commitment: 'finalized' },
//                 });

//                 console.log("All operations completed in single transaction:", result);

//                 return {
//                     mint: nftMint.publicKey,
//                     metadata: nftMetadata,
//                     collection: collectionMint.publicKey,
//                 };
//             } catch (error) {
//                 console.error("Error in NFT creation:", error);
//                 throw error;
//             }
//         } else {
//             throw new Error("Wallet not connected");
//         }
//     };

//     return handleMint();
// };

const createZKCollection = async (umi: any, userPublicKey: string) => {
    try {
        // Create a new keypair for the collection mint
        const collectionMint = generateSigner(umi);
        const collectionMetadataUri = "https://gateway.pinata.cloud/ipfs/ZK_COLLECTION_METADATA_URI";

        // Create the collection NFT with proper metadata
        const collectionNft = await createNft(umi, {
            mint: collectionMint,
            name: "ZK Collection",
            symbol: "ZKC",
            uri: collectionMetadataUri,
            sellerFeeBasisPoints: percentAmount(0),
            isCollection: true, // This marks it as a collection NFT
            updateAuthority: umi.identity,
        }).sendAndConfirm(umi);

        console.log("Collection created with mint:", collectionMint.publicKey);
        return collectionMint.publicKey;
    } catch (error) {
        console.error("Error creating collection:", error);
        throw error;
    }
};


const CreateNft = async (base64Image: string, name: string, wallet: any) => {
    const handleMint = async () => {
        if (wallet.publicKey && wallet.connected) {
            const umi = createUmi("https://devnet.helius-rpc.com/?api-key=daee1b98-f564-4352-b8aa-d41654bc0e02");
            umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

            const userPublicKey = wallet.publicKey.toBase58();
            try {
                // Step 1: Create ZK Collection
                const zkCollectionMint = await createZKCollection(umi, userPublicKey);
                console.log("Collection mint created:", zkCollectionMint);

                // Step 2: Upload NFT Metadata to Pinata
                const uriHash = await uploadToPinata(base64Image, userPublicKey);
                const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

                // Step 3: Mint NFT
                const nftMintSigner = generateSigner(umi);
                const mintTx = await createNft(umi, {
                    mint: nftMintSigner,
                    name,
                    uri,
                    sellerFeeBasisPoints: percentAmount(0),
                    updateAuthority: umi.identity,
                    collection: {
                        verified: false,
                        key: zkCollectionMint,
                    },
                });

                // Send and confirm the mint transaction
                const result = await mintTx.sendAndConfirm(umi);
                console.log("NFT mint result:", result);

                // Find PDAs for metadata and master edition
                const nftMetadata = findMetadataPda(umi, { mint: nftMintSigner.publicKey });
                const collectionMetadata = findMetadataPda(umi, { mint: zkCollectionMint });
                const collectionMasterEdition = findMasterEditionPda(umi, { mint: zkCollectionMint });

                // Step 4: Verify Collection
                const verifyTx = await verifyCollection(umi, {
                    metadata: nftMetadata,
                    collectionAuthority: umi.identity,
                    collectionMint: zkCollectionMint,
                    collection: collectionMetadata,
                    collectionMasterEditionAccount: collectionMasterEdition,
                });

                await verifyTx.sendAndConfirm(umi);
                console.log("NFT successfully indexed into ZK Collection");

                return {
                    mint: nftMintSigner.publicKey,
                    metadata: nftMetadata,
                    collection: zkCollectionMint,
                };
            } catch (error) {
                console.error("Error minting NFT:", error);
                throw error;
            }
        } else {
            throw new Error("Wallet not connected");
        }
    };

    return handleMint();
};


export default CreateNft;

function createMetadata(umi: any, arg1: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    updateAuthority: any;
    mint: KeypairSigner;
}) {
    throw new Error("Function not implemented.");
}