'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CustomWalletButton } from '@/component/ui/CustomWalletButton';
import { useModelStore } from '@/stores/useModel-store';
import { LuChevronDown } from 'react-icons/lu';

interface ChatHeaderProps {
  isMobile: boolean;
  onMenuToggle?: () => void;
  credits?: number;
  isLoadingCredits?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isMobile,
  onMenuToggle,
  credits = 0,
  isLoadingCredits = false,
}) => {
  const { selectedModel, setSelectedModel } = useModelStore();
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const models: Array<'DeepSeek' | 'Mistral'> = ['DeepSeek', 'Mistral'];

  return (
    <header className="sticky top-0 z-50 bg-[#000]/80 backdrop-blur-xl border-b border-[#1E2A45]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section: Menu (mobile) + Logo */}
        <div className="flex items-center gap-3">
          {isMobile && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 text-zkDarkPurple hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-3">
            <Image
              src="/images/tiger.svg"
              alt="ZkTerminal Logo"
              width={32}
              height={32}
              className="transition-transform hover:scale-105"
            />
            <span className="font-ttfirs text-xl font-semibold text-white hidden sm:block">
              ZkTerminal
            </span>
          </div>
        </div>

        {/* Right Section: Credits, Model Selector, Wallet */}
        <div className="flex items-center gap-3">
          {/* Credits Display - Hidden on mobile */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1426] border border-[#1E2A45]">
              <span className="text-sm text-zkDarkPurple">Credits:</span>
              {isLoadingCredits ? (
                <span className="text-sm font-mono text-zkDarkPurple animate-pulse">...</span>
              ) : (
                <span className="text-sm font-mono text-zkNeonGreen">{credits}</span>
              )}
            </div>
          )}

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-[#0A1426] border border-[#1E2A45]
                         rounded-lg text-sm text-white hover:border-zkPurple/50 transition-colors"
            >
              <span className="hidden sm:inline">{selectedModel}</span>
              <span className="sm:hidden">{selectedModel.slice(0, 2)}</span>
              <LuChevronDown
                className={`w-4 h-4 text-zkDarkPurple transition-transform ${
                  isModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isModelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsModelDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-[#0A1426] border border-[#1E2A45]
                                rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                  {models.map((model) => (
                    <button
                      key={model}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors
                                  ${selectedModel === model
                                    ? 'bg-zkPurple/20 text-zkIndigo'
                                    : 'text-white hover:bg-[#1E2A45]'
                                  }`}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Wallet Button */}
          <div className="wallet-button">
            <CustomWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
