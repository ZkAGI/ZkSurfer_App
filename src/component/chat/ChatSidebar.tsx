'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LuHome, LuStore, LuCompass, LuKey, LuChevronDown, LuChevronUp, LuMoreVertical, LuHelpCircle, LuX } from 'react-icons/lu';
import { Dictionary } from '@/app/i18n/types';
import { DSStats, DSGlow } from '@/component/design-system';

interface Agent {
  id: string;
  name: string;
  paymentStatus: boolean;
}

interface ChatSidebarProps {
  dictionary?: Dictionary;
  agents?: {
    items: Agent[];
    count: number;
  };
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAgentClick?: (agentId: string) => void;
  credits?: {
    used: number;
    total: number;
  };
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  dictionary,
  agents,
  isMobile,
  isOpen,
  onClose,
  onAgentClick,
  credits = { used: 150, total: 500 },
}) => {
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang;
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(true);
  const [activeAgentMenu, setActiveAgentMenu] = useState<string | null>(null);

  const navItems = [
    { href: `/${lang}`, icon: <LuHome className="w-4 h-4" />, label: dictionary?.sidebar.home || 'Home' },
    { href: `/${lang}/api-key`, icon: <LuKey className="w-4 h-4" />, label: dictionary?.sidebar.apiKeys || 'API Keys' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === `/${lang}`) return pathname === `/${lang}` || pathname === `/${lang}/home`;
    return pathname.startsWith(href);
  };

  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 bottom-0 w-72 bg-dsBgAlt border-r border-dsBorder z-50
       transform transition-transform duration-300 ease-in-out
       ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    : 'w-64 bg-dsBgAlt border border-dsBorder rounded-xl flex-shrink-0 relative overflow-hidden';

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Background glow */}
        {!isMobile && <DSGlow position="top-left" size="sm" className="opacity-30" />}

        <div className="flex flex-col h-full relative z-10">
          {/* Header */}
          <div className="p-4 border-b border-dsBorder flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/tiger.svg"
                alt="Logo"
                width={24}
                height={24}
              />
              <span className="font-syne text-white font-semibold">ZkTerminal</span>
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1.5 text-dsMuted hover:text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    ds-sidebar-nav-item
                    ${isActive ? 'active' : ''}
                  `}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-4 border-t border-dsBorder" />

          {/* Agents Section */}
          <div className="flex-grow overflow-hidden p-4">
            <button
              onClick={() => setIsAgentsExpanded(!isAgentsExpanded)}
              className="w-full flex items-center justify-between mb-3 text-white font-syne font-semibold text-sm"
            >
              <span>{dictionary?.sidebar.agents?.title || 'Agents'}</span>
              {isAgentsExpanded ? (
                <LuChevronUp className="w-4 h-4 text-dsMuted" />
              ) : (
                <LuChevronDown className="w-4 h-4 text-dsMuted" />
              )}
            </button>

            {isAgentsExpanded && (
              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-450px)] pr-1">
                {agents?.items && agents.items.length > 0 ? (
                  agents.items.map((agent) => (
                    <div
                      key={agent.id}
                      className="relative flex items-center justify-between px-3 py-2.5 rounded-lg
                                 hover:bg-dsBorder/50 transition-colors cursor-pointer group"
                      onClick={() => onAgentClick?.(agent.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status indicator */}
                        <div className="relative">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              agent.paymentStatus ? 'bg-dsGreen' : 'bg-red-500'
                            }`}
                          />
                          {agent.paymentStatus && (
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-dsGreen animate-ping opacity-30" />
                          )}
                        </div>
                        <span className="text-sm font-dmSans text-white truncate max-w-[140px]">
                          {agent.name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAgentMenu(activeAgentMenu === agent.id ? null : agent.id);
                        }}
                        className="p-1 text-dsMuted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <LuMoreVertical className="w-4 h-4" />
                      </button>

                      {/* Agent menu dropdown */}
                      {activeAgentMenu === agent.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-dsBg border border-dsBorder
                                        rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                          <button className="w-full px-3 py-2 text-left text-sm font-dmSans text-white hover:bg-dsBorder transition-colors">
                            Edit
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm font-dmSans text-red-400 hover:bg-dsBorder transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-dsMuted text-sm font-dmSans">
                    <p>No agents created yet</p>
                    <p className="mt-1 text-xs opacity-70">Use /create-swarm to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Credits Panel */}
          <div className="p-4">
            <DSStats
              label="Credits remaining"
              value={credits.total - credits.used}
              maxValue={credits.total}
              progress={((credits.total - credits.used) / credits.total) * 100}
            />
          </div>

          {/* Docs Link */}
          <div className="p-4">
            <a
              href="https://docs.zkagi.ai/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="p-[1px] rounded-xl bg-gradient-to-r from-dsPurple/30 via-dsGreen/40 to-dsPurple/30">
                <div className="flex items-center gap-4 bg-dsBg p-4 rounded-xl hover:bg-dsBgAlt transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dsGreen/20 to-dsPurple/20
                                  flex items-center justify-center">
                    <LuHelpCircle className="w-5 h-5 text-dsGreen" />
                  </div>
                  <div>
                    <div className="font-syne text-sm bg-gradient-to-r from-dsGreen to-dsPurple-light text-transparent bg-clip-text font-semibold">
                      {dictionary?.docs?.needHelp || 'Need help?'}
                    </div>
                    <div className="text-xs font-dmSans text-dsMuted">
                      {dictionary?.docs?.checkDocs || 'Check the docs'}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
