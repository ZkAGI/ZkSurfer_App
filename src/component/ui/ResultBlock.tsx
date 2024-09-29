// import React, { useState } from 'react';
// import Image from 'next/image';

// interface ResultBlockProps {
//     content: string;
//     type: 'image' | 'code';
//     onMintNFT?: (content: string) => void;
//     onDownloadProof: () => void;
// }

// const ResultBlock: React.FC<ResultBlockProps> = ({ content, type, onMintNFT, onDownloadProof }) => {
//     const [isCopied, setIsCopied] = useState(false);

//     const copyToClipboard = () => {
//         navigator.clipboard.writeText(content).then(() => {
//             setIsCopied(true);
//             setTimeout(() => setIsCopied(false), 2000);
//         });
//     };

//     console.log('type', type)

//     return (
//         <div className="bg-gray-800 rounded-lg p-4 my-2">
//             {type === 'image' ? (
//                 <div>
//                     <img src={`data:image/jpeg;base64,${content}`} alt="Generated content" className="w-full rounded-lg" />
//                     <div className="mt-2 flex space-x-2">
//                         <button
//                             onClick={onDownloadProof}
//                             className="bg-blue-500 text-white px-2 py-1 rounded"
//                         >
//                             Download Proof
//                         </button>
//                         {onMintNFT && (
//                             <button
//                                 onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
//                                 className="bg-green-500 text-white px-2 py-1 rounded"
//                             >
//                                 Mint NFT
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             ) : (
//                 <div>
//                     <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
//                         <code>{content}</code>
//                     </pre>
//                     <div className="mt-2 flex space-x-2">
//                         <button
//                             onClick={onDownloadProof}
//                             className="bg-blue-500 text-white px-2 py-1 rounded"
//                         >
//                             Download Proof
//                         </button>
//                         <button
//                             onClick={copyToClipboard}
//                             className="bg-purple-500 text-white px-2 py-1 rounded"
//                         >
//                             {isCopied ? 'Copied!' : 'Copy to Clipboard'}
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ResultBlock;

import React, { useState } from 'react';
import Image from 'next/image';

interface ResultBlockProps {
    content: string;
    type: 'image' | 'code';
    language?: string; // Optional prop to show the programming language for code blocks
    onMintNFT?: (content: string) => void;
    onDownloadProof: () => void;
}

const ResultBlock: React.FC<ResultBlockProps> = ({ content, type, language, onMintNFT, onDownloadProof }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        const codeWithoutLanguage = content.split('\n').slice(1).join('\n'); // Skips the first line (language line)
        navigator.clipboard.writeText(codeWithoutLanguage).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 my-2">
            {type === 'image' ? (
                <div>
                    <div className="mt-2 flex space-x-2 justify-between mb-1">
                        <div>
                            <button
                                onClick={onDownloadProof}
                                className="flex items-center space-x-2  text-white  rounded"
                            >
                                <span className='text-[#A0AEC0]'>Download Proof</span>
                                <Image
                                    src="images/downloadProof.svg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                />
                            </button>
                        </div>
                        {onMintNFT && (
                            <div>
                                <button
                                    onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
                                    className="flex items-center space-x-2  text-white rounded"
                                >
                                    <span className='text-[#A0AEC0]'>Mint Nft</span>
                                    <Image
                                        src="images/nft.svg"
                                        alt="logo"
                                        width={30}
                                        height={30}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                    <img src={`data:image/jpeg;base64,${content}`} alt="Generated content" className="w-full rounded-lg" />
                </div>
            ) : (
                <div>
                    <div className="flex space-x-2 justify-between mb-1">
                        <div>
                            <button
                                onClick={onDownloadProof}
                                className="flex items-center space-x-2  text-white rounded"
                            >
                                <span className='text-[#A0AEC0]'>Download Proof</span>
                                <Image
                                    src="images/downloadProof.svg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                />
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center space-x-2  text-[#A0AEC0] rounded "
                            >
                                {isCopied ? 'Copied!' : 'Copy Code'}
                                <Image
                                    src="images/Copy.svg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                />
                            </button>
                        </div>
                    </div>
                    {language && <div className="text-sm text-gray-400 mb-1">{language}</div>} {/* Language line displayed outside */}
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-fit">
                        <code>{content}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ResultBlock;