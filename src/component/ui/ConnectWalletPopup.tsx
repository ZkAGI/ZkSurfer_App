// import React from 'react';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { useDisconnect } from 'wagmi';
// import KimaTransferAgent from './KimaForm';

// type WalletConnectPopupProps = {
//     isOpen: boolean;
//     onClose: () => void;
// };

// const WalletConnectPopup: React.FC<WalletConnectPopupProps> = ({ isOpen, onClose }) => {
//     const { disconnect } = useDisconnect();

//     if (!isOpen) return null;

//     return (
//         // Overlay
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//             {/* Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black opacity-50"
//                 onClick={onClose}
//             ></div>
//             {/* Modal */}
//             <div className="p-6 rounded shadow-lg z-10 w-80 bg-[#171D3D]">
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold">Connect Wallet</h2>
//                     <button onClick={onClose} className="text-white text-2xl leading-none">&times;</button>
//                 </div>
//                 {/* Using RainbowKit’s custom connect button to access connection details */}
//                 <ConnectButton.Custom>
//                     {({ account, chain, openConnectModal, mounted }) => {
//                         if (mounted && account && chain) {
//                             return (
//                                 <div className="space-y-2">
//                                     {/* <div>
//                                         <span className="font-medium">Address:</span> {account.address}
//                                     </div>
//                                     <div>
//                                         <span className="font-medium">Chain:</span> {chain.name}
//                                     </div>
//                                     <button
//                                         onClick={() => disconnect()}
//                                         className="mt-4 border bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
//                                     >
//                                         Disconnect
//                                     </button> */}
//                                     <KimaTransferAgent />
//                                 </div>
//                             );
//                         }
//                         // Otherwise, show a connect wallet button
//                         return (
//                             <button
//                                 onClick={openConnectModal}
//                                 className="border bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
//                             >
//                                 Connect Wallet
//                             </button>
//                         );
//                     }}
//                 </ConnectButton.Custom>
//             </div>
//         </div>
//     );
// };

// export default WalletConnectPopup;

"use client";
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
// import KimaTransferAgent from './KimaForm';

type WalletConnectPopupProps = {
    isOpen: boolean;
    onClose: () => void;
};

const WalletConnectPopup: React.FC<WalletConnectPopupProps> = ({ isOpen, onClose }) => {
    const { disconnect } = useDisconnect();

    if (!isOpen) return null;

    return (
        // Overlay
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="p-6 rounded shadow-lg z-10 w-full max-w-2xl bg-[#171D3D] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
                    <button
                        onClick={onClose}
                        className="text-white text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* RainbowKit’s Custom Connect Button */}
                {/* <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, mounted }) => {
                        if (mounted && account && chain) {
                            return (
                                <div className="space-y-2">
                      
                                    <KimaTransferAgent />
                                </div>
                            );
                        }
               
                        return (
                            <button
                                onClick={openConnectModal}
                                className="border bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
                            >
                                Connect Wallet
                            </button>
                        );
                    }}
                </ConnectButton.Custom> */}
                <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, mounted }) => {
                        if (mounted && account && chain) {
                            return (
                                <div className="space-y-2">
                                    {/* Pass the callback down */}
                                    {/* <KimaTransferAgent onTransferSuccess={onClose} /> */}
                                </div>
                            );
                        }
                        return (
                            <button
                                onClick={openConnectModal}
                                className="border bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
                            >
                                Connect Wallet
                            </button>
                        );
                    }}
                </ConnectButton.Custom>

            </div>
        </div>
    );
};

export default WalletConnectPopup;
