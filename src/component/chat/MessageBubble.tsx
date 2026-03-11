'use client';

import React from 'react';
import Image from 'next/image';
import { LuUser, LuDownload, LuShare2, LuCopy, LuCheck } from 'react-icons/lu';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  children: React.ReactNode;
  timestamp?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  showActions?: boolean;
  animate?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  children,
  timestamp,
  onDownload,
  onShare,
  onCopy,
  showActions = true,
  animate = true,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const isUser = role === 'user';

  const handleCopy = () => {
    onCopy?.();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-4 mb-6 ${animate ? 'animate-fadeIn' : ''} ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isUser
              ? 'bg-zkPurple/20 border border-zkPurple/30'
              : 'bg-gradient-to-br from-zkIndigo/20 to-zkPurple/20 border border-[#1E2A45]'
          }`}
        >
          {isUser ? (
            <LuUser className="w-5 h-5 text-zkPurple" />
          ) : (
            <Image
              src="/images/tiger.svg"
              alt="ZkTerminal"
              width={24}
              height={24}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Header with role name */}
        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span
            className={`text-sm font-sourceCode ${
              isUser
                ? 'text-zkDarkPurple'
                : 'bg-gradient-to-br from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent'
            }`}
          >
            {isUser ? 'You' : 'ZkTerminal'}
          </span>

          {/* Actions for assistant messages */}
          {!isUser && showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-1.5 text-zkDarkPurple hover:text-white transition-colors"
                  title="Download"
                >
                  <LuDownload className="w-4 h-4" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-1.5 text-zkDarkPurple hover:text-white transition-colors"
                  title="Share"
                >
                  <LuShare2 className="w-4 h-4" />
                </button>
              )}
              {onCopy && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-zkDarkPurple hover:text-white transition-colors"
                  title={isCopied ? 'Copied!' : 'Copy'}
                >
                  {isCopied ? (
                    <LuCheck className="w-4 h-4 text-zkNeonGreen" />
                  ) : (
                    <LuCopy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser ? 'message-bubble-user' : 'message-bubble-assistant'
          }`}
        >
          <div className="text-white text-sm leading-relaxed">{children}</div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-zkDarkPurple mt-2 opacity-60">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
