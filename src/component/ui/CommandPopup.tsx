import React from 'react';

type Command = 'image-gen' | 'create-agent' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'save' | 'saves' | 'character-gen'  | 'api' | 'generate-voice-clone' | 'video-gen' | 'privacy-ai'| 'generate-private';
// | 'bridge' |'video-lipsync' | 'UGC' | 'img-to-video'  ;
// |'train' |'post' |'select'|'launch'

interface CommandOption {
    command: Command;
    description: string;
    additionalInfo?: string;
}

interface CommandPopupProps {
    onSelect: (command: Command) => void;
    className?: string;
}

const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => {
    const commands: CommandOption[] = [
        // {
        //     command: 'create-agent',
        //     description: 'Generate sentient AI agent coin ',
        // },
        {
            command: 'image-gen',
            description: 'Image generation with or without ticker. Generated image can be used for minting NFT',
        },
        {
            command: 'api',
            description: 'Generate api-key for Zynapse API',
        },
        // {
        //     command: 'content',
        //     description: 'Ticker-based content generation',
        // },
        // {
        //     command: 'select',
        //     description: 'Select tickers',
        // },
        // {
        //     command: 'post',
        //     description: 'To post or schedule the tweet',
        // },
        // // {
        //     command: 'tokens',
        //     description: 'To provide Twitter access token and its secret',
        // },
        // {
        //     command: 'tweet',
        //     description: 'To post and schedule the Twitter post',
        //     additionalInfo: '(id)',
        // },
        // {
        //     command: 'tweets',
        //     description: 'To post and schedule multiple Twitter posts',
        //     additionalInfo: '(id1, id2,...)',
        // },
        // {
        //     command: 'generate-tweet',
        //     description: 'Generates those many tweets',
        //     additionalInfo: '(Number of tweets)',
        // },
        // {
        //     command: 'generate-tweet-image',
        //     description: 'Generates an image based on ticker for tweet',
        // },
        // {
        //     command: 'generate-tweet-images',
        //     description: 'Generates images based on ticker for tweets',
        // },
        // {
        //     command: 'save',
        //     description: 'Saves one generated tweet',
        //     additionalInfo: '(id)',
        // },
        // {
        //     command: 'saves',
        //     description: 'Saves multiple generated tweets',
        //     additionalInfo: '(id1, id2,...)',
        // },
        // {
        //     command: 'launch',
        //     description: 'Launching your saved ai coin on pump.fun',
        // },
        // {
        //     command: 'character-gen',
        //     description: 'To generate characters',
        // },
        // {
        //     command: 'train',
        //     description: 'To continuously train and improve your agent',
        // },
        // {
        //     command: 'video-lipsync',
        //     description: 'To merge video and audio and provide a downloadable merged video',
        // },
        // {
        //     command: 'UGC',
        //     description: 'generate UGC',
        // },
        // {
        //     command: 'img-to-video',
        //     description: 'To convert image to video',
        // },
        // {
        //     command: 'generate-voice-clone',
        //     description: 'Add a reference audio and text, to geenrate a cloned voice base don reference for given text'
        // },
        {
            command: 'video-gen',
            description: 'Enter a prompt to generate a video'
        },
        {
  command: 'generate-private',
  description: 'Upload PDF/DOC/TXT privately → generate zk-proof JSON (auto download)',
},
        {
  command: 'privacy-ai',
  description: 'Query a zk-proof JSON: upload a proof + ask a question',
},
        // {
        //     command: 'bridge',
        //     description: 'Kima Integration'
        // }
    ];

    return (
        <div className="absolute bottom-full left-0 bg-[#0A0F2C] rounded-lg shadow-lg w-[80vw] max-w-[800px] md:w-[800px] max-h-[600px] overflow-y-auto">
            <div className="sticky top-0 bg-[#0A0F2C] p-3 border-b border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search commands..."
                        className="w-full bg-[#171D3D] text-white rounded-lg px-3 py-2 pl-10"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {commands.map((cmd) => (
                        <button
                            key={cmd.command}
                            onClick={() => onSelect(cmd.command)}
                            className="block w-full text-left p-3 rounded-lg bg-[#171D3D] hover:bg-[#24284E] transition-colors"
                        >
                            <div className="flex flex-col">
                                <p className="text-purple-400 font-mono">
                                    /{cmd.command}
                                    {cmd.additionalInfo && (
                                        <span className="text-blue-400 text-sm ml-1">
                                            {cmd.additionalInfo}
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {cmd.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommandPopup;
