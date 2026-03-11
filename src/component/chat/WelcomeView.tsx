'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { LuSparkles, LuImage, LuShield, LuVideo, LuFileText, LuBrainCircuit } from 'react-icons/lu';

interface Command {
  id: string;
  label: string;
  description: string;
  command: string;
  icon: React.ReactNode;
}

interface WelcomeViewProps {
  onCommandClick: (command: string) => void;
  dictionary?: {
    commands?: Array<{
      label: string;
      command: string;
      description: string;
    }>;
  };
}

const defaultCommands: Command[] = [
  {
    id: '01',
    label: 'Create Agent SWARM',
    description: 'Build autonomous AI agent swarms with collaborative intelligence and task delegation',
    command: '/create-swarm',
    icon: <LuBrainCircuit className="w-6 h-6" />,
  },
  {
    id: '02',
    label: 'Generate Image',
    description: 'Create stunning AI-generated images with optional ticker branding and NFT minting',
    command: '/image-gen',
    icon: <LuImage className="w-6 h-6" />,
  },
  {
    id: '03',
    label: 'Generate Video',
    description: 'Transform prompts into dynamic video content powered by AI',
    command: '/video-gen',
    icon: <LuVideo className="w-6 h-6" />,
  },
  {
    id: '04',
    label: 'Privacy AI',
    description: 'Query documents with zero-knowledge proofs for privacy-preserving AI analysis',
    command: '/privacy-ai',
    icon: <LuShield className="w-6 h-6" />,
  },
];

const FeatureCard: React.FC<{
  number: string;
  title: string;
  description: string;
  command: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ number, title, description, icon, onClick }) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className="feature-card card-glow text-left group w-full animate-fadeIn"
      style={{ animationDelay: `${parseInt(number) * 100}ms` }}
    >
      {/* Number Badge */}
      <div className="number-badge mb-4">{number}</div>

      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zkIndigo/20 to-zkPurple/20
                        flex items-center justify-center text-zkPurple
                        group-hover:from-zkIndigo/30 group-hover:to-zkPurple/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-ttfirs font-semibold text-white group-hover:text-zkIndigo transition-colors">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-zkDarkPurple text-sm leading-relaxed">
        {description}
      </p>

      {/* Hover Arrow */}
      <div className="mt-4 flex items-center gap-2 text-zkPurple opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-mono">Enter</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </button>
  );
};

const WelcomeView: React.FC<WelcomeViewProps> = ({ onCommandClick, dictionary }) => {
  // Map dictionary commands to our format if available, otherwise use defaults
  const commands: Command[] = dictionary?.commands?.map((cmd, index) => {
    const defaultCmd = defaultCommands[index] || defaultCommands[0];
    return {
      id: String(index + 1).padStart(2, '0'),
      label: cmd.label?.trim().toLowerCase() === 'create agent' ? 'Create Agent SWARM' : cmd.label,
      description: cmd.description,
      command: cmd.command,
      icon: defaultCmd.icon,
    };
  }) || defaultCommands;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 md:px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14 animate-slideUp">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-zkPurple/10 border border-zkPurple/20 mb-6">
          <LuSparkles className="w-4 h-4 text-zkNeonGreen" />
          <span className="text-sm font-mono text-zkDarkPurple">Zero Employee Enterprise</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-ttfirs font-bold mb-4 text-white">
          What would you like to{' '}
          <span className="bg-gradient-to-r from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent">
            create
          </span>
          ?
        </h1>

        <p className="text-zkDarkPurple text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Build autonomous AI agents, generate images, or explore privacy-preserving AI
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl w-full">
        {commands.slice(0, 4).map((cmd) => (
          <FeatureCard
            key={cmd.id}
            number={cmd.id}
            title={cmd.label}
            description={cmd.description}
            command={cmd.command}
            icon={cmd.icon}
            onClick={() => onCommandClick(cmd.command)}
          />
        ))}
      </div>

      {/* Quick Command Hint */}
      <div className="mt-10 text-center animate-fadeIn" style={{ animationDelay: '500ms' }}>
        <div className="inline-flex items-center gap-3 bg-[#0A1426] px-5 py-3 rounded-xl border border-[#1E2A45]">
          <span className="text-zkDarkPurple text-sm">Type</span>
          <code className="command-prefix text-lg">/</code>
          <span className="text-zkDarkPurple text-sm">to see all commands</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
