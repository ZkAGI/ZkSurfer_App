'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Image, BrainCircuit, Key, Shield, Video, FileText, Stethoscope, CheckCircle } from 'lucide-react';

type Command = 'image-gen' | 'create-agent' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'save' | 'saves' | 'character-gen'  | 'api' | 'generate-voice-clone' | 'video-gen' | 'privacy-ai'| 'generate-private' | 'create-swarm' | 'medical-proof-create'
  | 'medical-proof-verify';

interface CommandOption {
    command: Command;
    description: string;
    additionalInfo?: string;
    icon: React.ReactNode;
    category: 'creation' | 'privacy' | 'utility';
}

interface CommandPopupProps {
    onSelect: (command: Command) => void;
    className?: string;
}

const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const commands: CommandOption[] = [
        {
            command: 'create-swarm',
            description: 'Build autonomous AI agent swarms with collaborative intelligence',
            icon: <BrainCircuit className="w-4 h-4" />,
            category: 'creation',
        },
        {
            command: 'image-gen',
            description: 'Generate images with optional ticker branding and NFT minting',
            icon: <Image className="w-4 h-4" />,
            category: 'creation',
        },
        {
            command: 'video-gen',
            description: 'Transform prompts into dynamic video content',
            icon: <Video className="w-4 h-4" />,
            category: 'creation',
        },
        {
            command: 'api',
            description: 'Generate API key for Zynapse API access',
            icon: <Key className="w-4 h-4" />,
            category: 'utility',
        },
        {
            command: 'privacy-ai',
            description: 'Query documents using zero-knowledge proofs',
            icon: <Shield className="w-4 h-4" />,
            category: 'privacy',
        },
        {
            command: 'generate-private',
            description: 'Upload documents and generate zk-proof JSON',
            icon: <FileText className="w-4 h-4" />,
            category: 'privacy',
        },
        {
            command: 'medical-proof-create',
            description: 'Create private medical knowledge base with ZK proofs',
            icon: <Stethoscope className="w-4 h-4" />,
            category: 'privacy',
        },
        {
            command: 'medical-proof-verify',
            description: 'Verify medical ZK proof using KB ID and proof ID',
            icon: <CheckCircle className="w-4 h-4" />,
            category: 'privacy',
        },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Focus search input on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
                e.preventDefault();
                onSelect(filteredCommands[selectedIndex].command);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredCommands, selectedIndex, onSelect]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
        selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [selectedIndex]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'creation': return { text: 'text-dsPurple-light', bg: 'bg-dsPurple/15' };
            case 'privacy': return { text: 'text-dsGreen', bg: 'bg-dsGreen/15' };
            case 'utility': return { text: 'text-amber-400', bg: 'bg-amber-400/15' };
            default: return { text: 'text-dsMuted', bg: 'bg-dsBorder' };
        }
    };

    return (
        <div className="absolute bottom-full left-0 mb-2 w-[90vw] max-w-[600px] md:w-[600px]
                        bg-dsBgAlt rounded-xl border border-dsBorder shadow-2xl
                        overflow-hidden animate-slide-in">
            {/* Search Header */}
            <div className="p-4 border-b border-dsBorder">
                <div className="flex items-center gap-3">
                    <span className="text-dsPurple font-dmMono text-lg font-bold">$</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dsMuted" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search commands..."
                            className="w-full bg-transparent text-white placeholder:text-dsMuted
                                       focus:outline-none pl-10 pr-4 py-2 font-dmSans"
                        />
                    </div>
                </div>
            </div>

            {/* Commands List */}
            <div ref={listRef} className="p-2 max-h-[320px] overflow-y-auto">
                {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd, index) => {
                        const styles = getCategoryStyles(cmd.category);
                        return (
                            <button
                                key={cmd.command}
                                onClick={() => onSelect(cmd.command)}
                                className={`w-full flex items-center gap-4 p-3 rounded-lg
                                           transition-all text-left group
                                           ${index === selectedIndex
                                               ? 'bg-dsPurple/15 border border-dsPurple/30'
                                               : 'hover:bg-dsBorder/50 border border-transparent'
                                           }`}
                            >
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.bg}`}>
                                    <span className={styles.text}>{cmd.icon}</span>
                                </div>

                                {/* Command & Description */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-dsPurple-light font-dmMono text-sm">/{cmd.command}</span>
                                        {cmd.additionalInfo && (
                                            <span className="text-dsMuted text-xs">{cmd.additionalInfo}</span>
                                        )}
                                    </div>
                                    <p className="text-dsMuted text-xs mt-0.5 truncate">
                                        {cmd.description}
                                    </p>
                                </div>

                                {/* Enter hint */}
                                <span className={`px-2 py-1 text-xs rounded bg-dsBorder text-dsMuted font-dmMono
                                                  transition-opacity
                                                  ${index === selectedIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    Enter
                                </span>
                            </button>
                        );
                    })
                ) : (
                    <div className="py-8 text-center text-dsMuted">
                        <p className="text-sm">No commands found</p>
                        <p className="text-xs mt-1 opacity-70">Try a different search term</p>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-dsBorder flex items-center justify-between text-xs text-dsMuted">
                <span className="flex items-center gap-1">
                    Use
                    <kbd className="px-1.5 py-0.5 rounded bg-dsBorder text-dsMuted font-dmMono mx-1">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-dsBorder text-dsMuted font-dmMono">↓</kbd>
                    to navigate
                </span>
                <span className="flex items-center gap-1">
                    Press
                    <kbd className="px-1.5 py-0.5 rounded bg-dsBorder text-dsMuted font-dmMono mx-1">Enter</kbd>
                    to select
                </span>
            </div>
        </div>
    );
};

export default CommandPopup;
