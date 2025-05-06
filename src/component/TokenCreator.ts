import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { useWalletStore } from '@/stores/wallet-store';

type PinataResponse = {
    metadata: {
        name: string;
        symbol: string;
        description: string;
        image: string;
    };
    metadataUri: string;
};

const uploadToPinata = async (base64Image: string, name: string, symbol: string, description: string) => {
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    if (!pinataApiKey) {
        throw new Error("NEXT_PUBLIC_PINATA_API_KEY is not defined in the environment variables.");
    }

    if (!pinataSecretApiKey) {
        throw new Error("NEXT_PUBLIC_PINATA_API_SECRET is not defined in the environment variables.");
    }

    try {
        console.log('base64Image', base64Image)
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
                "name": name,
                "symbol": symbol,
                "description": description,
                "image": imageUrl
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
            return {
                metadata,
                metadataUri: `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`,
            };
        }
        catch (error) {
            console.error('Error uploading to Pinata:', error);
        }
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
    }
};

// Store token mint address using the Zustand store
const storeTokenMint = (mintAddress: string) => {
    try {
        // Access the Zustand store and use its setter
        const { setTokenMintAddress } = useWalletStore.getState();
        
        if (setTokenMintAddress) {
            setTokenMintAddress(mintAddress);
            return true;
        }
        
        return false;
    } catch (error) {
        console.warn('Unable to store token mint address in store:', error);
        return false;
    }
};

export const TokenCreator = async ({
    name,
    symbol,
    description,
    imageBase64,
    wallet,
    onTokenCreated
}: {
    name: string;
    symbol: string;
    description: string;
    imageBase64: string;
    wallet: any;
    onTokenCreated?: (mintAddress: string) => void;
}) => {
    try {
        const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim();

        if (!RPC_ENDPOINT) {
            throw new Error("NEXT_PUBLIC_RPC_ENDPOINT is not defined in the environment variables.");
        }

        try {
            const web3Connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
            console.log("Connected to:", RPC_ENDPOINT);
        } catch (error) {
            console.error("Connection error:", error);
            throw error;
        }

        const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

        const mintKeypair = Keypair.generate();

        const ipfsFormData = new FormData();

        if (imageBase64) {
            // Convert base64 to blob
            const base64Response = await fetch(imageBase64);
            const imageBlob = await base64Response.blob();
            ipfsFormData.append("file", imageBlob);
        }

        ipfsFormData.append("name", name);
        ipfsFormData.append("symbol", symbol);
        ipfsFormData.append("description", description);
        ipfsFormData.append("showName", "true");

        console.log('Uploading metadata to IPFS...');
        const metadataResponseRaw = await uploadToPinata(imageBase64, name, symbol, description);
        const metadataResponse = metadataResponseRaw?.metadata;
        const metadataUri = metadataResponseRaw?.metadataUri;

        console.log('Metadata Response:', metadataResponse);

        if (!metadataUri) {
            throw new Error('Failed to upload metadata to IPFS');
        }

        console.log('IPFS Response:', metadataResponse);

        // Get the create transaction from pump.fun
        const pumpResponse = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                publicKey: wallet.publicKey?.toString(),
                action: "create",
                tokenMetadata: {
                    name: metadataResponse?.name,
                    symbol: metadataResponse?.symbol,
                    uri: metadataUri
                },
                mint: mintKeypair.publicKey.toBase58(),
                denominatedInSol: "false",
                amount: 10000,
                slippage: 10,
                priorityFee: 0.0005,
                pool: "pump"
            })
        });

        if (pumpResponse.status === 200) {
            const data = await pumpResponse.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));

            const { blockhash } = await web3Connection.getLatestBlockhash('finalized');
            tx.message.recentBlockhash = blockhash;

            tx.sign([mintKeypair]);

            if (wallet.signTransaction) {
                const signedTx = await wallet.signTransaction(tx);
                const signature = await web3Connection.sendTransaction(signedTx);
                console.log("Pump.fun Transaction:", signature);
                
                const mintAddress = mintKeypair.publicKey.toString();
                console.log("Token Mint Address", mintAddress);
                
                // Store in Zustand store instead of localStorage
                storeTokenMint(mintAddress);
                
                // If a callback was provided, call it with the mint address
                if (onTokenCreated) {
                    onTokenCreated(mintAddress);
                }
                
                return {
                    mintAddress,
                    signature
                };
            } else {
                throw new Error('Wallet does not support signing');
            }
        } else {
            throw new Error(`Failed to create token: ${pumpResponse.statusText}`);
        }
    } catch (error) {
        console.error('Error in TokenCreator:', error);
        throw error;
    }
};