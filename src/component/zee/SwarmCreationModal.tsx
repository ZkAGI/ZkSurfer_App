'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAgentCart } from '@/stores/agent-cart-store';
import { useAgentFormStore } from '@/stores/agent-form-store';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import {
  X, ChevronRight, ChevronLeft, Check, Rocket, Zap,
  Users, BarChart3, DollarSign, Target, TrendingUp,
  Brain, Megaphone, Code, Settings, FileText, LineChart,
  Plus, Minus, Activity, Shield, Sparkles, Crown,
  ArrowRight, ExternalLink, GripVertical,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type StepId = 'mission' | 'hire' | 'orgchart' | 'budget' | 'launch';

interface AgentRole {
  id: string;
  role: string;
  title: string;
  desc: string;
  icon: typeof Brain;
  color: string;
  bg: string;
  cubImg: string;
  defaultBudgetPct: number;
  reports?: string;
  tasks: string[];
  metrics: { label: string; value: string }[];
}

interface SwarmTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
}

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; icon: typeof Target }[] = [
  { id: 'mission', label: 'Mission', icon: Target },
  { id: 'hire', label: 'Hire Agents', icon: Users },
  { id: 'orgchart', label: 'Org Chart', icon: BarChart3 },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'launch', label: 'Launch', icon: Rocket },
];

const TEMPLATES = [
  { id: 'defi', label: 'DeFi Protocol', mission: 'Build and scale a decentralized finance protocol with autonomous trading, liquidity management, and risk assessment powered by AI agents.', agents: ['ceo', 'cto', 'analytics', 'content'] },
  { id: 'nft', label: 'NFT Studio', mission: 'Create, curate, and market generative NFT collections with AI-driven art direction, community management, and sales optimization.', agents: ['ceo', 'cmo', 'content', 'analytics'] },
  { id: 'dao', label: 'DAO Operations', mission: 'Manage decentralized autonomous organization operations including governance, treasury management, community engagement, and strategic planning.', agents: ['ceo', 'coo', 'cmo', 'analytics'] },
  { id: 'trading', label: 'Trading Firm', mission: 'Operate an autonomous trading desk with market analysis, risk management, execution optimization, and performance reporting.', agents: ['ceo', 'cto', 'analytics', 'coo'] },
];

const AGENTS: AgentRole[] = [
  {
    id: 'ceo', role: 'CEO', title: 'Chief Executive Tiger',
    desc: 'Strategic vision, governance rules, and inter-agent orchestration',
    icon: Crown, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    cubImg: '/images/cubs/bd.png', defaultBudgetPct: 25,
    tasks: [
      'Define quarterly OKRs', 'Review agent performance', 'Approve budget changes',
      'Set governance policies', 'Coordinate cross-team initiatives'
    ],
    metrics: [
      { label: 'Decisions/day', value: '47' },
      { label: 'Efficiency', value: '94%' },
      { label: 'Uptime', value: '99.9%' },
    ],
  },
  {
    id: 'cmo', role: 'CMO', title: 'Chief Marketing Tiger',
    desc: 'Brand strategy, content scheduling, and social media campaigns',
    icon: Megaphone, color: '#ec4899', bg: 'rgba(236,72,153,0.1)',
    cubImg: '/images/cubs/content.png', defaultBudgetPct: 20, reports: 'ceo',
    tasks: [
      'Schedule social posts', 'Analyze engagement metrics', 'Create campaign briefs',
      'Monitor brand sentiment', 'Generate marketing copy'
    ],
    metrics: [
      { label: 'Posts/week', value: '28' },
      { label: 'Engagement', value: '4.2%' },
      { label: 'Reach', value: '125K' },
    ],
  },
  {
    id: 'cto', role: 'CTO', title: 'Chief Technology Tiger',
    desc: 'Smart contract deployment, infrastructure monitoring, and tech stack decisions',
    icon: Code, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
    cubImg: '/images/cubs/trading.png', defaultBudgetPct: 20, reports: 'ceo',
    tasks: [
      'Deploy smart contracts', 'Monitor infrastructure', 'Review code changes',
      'Optimize gas usage', 'Security audits'
    ],
    metrics: [
      { label: 'Deployments', value: '12' },
      { label: 'Uptime', value: '99.95%' },
      { label: 'Gas saved', value: '23%' },
    ],
  },
  {
    id: 'coo', role: 'COO', title: 'Chief Operations Tiger',
    desc: 'Workflow automation, process optimization, and operational excellence',
    icon: Settings, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
    cubImg: '/images/cubs/support.png', defaultBudgetPct: 15, reports: 'ceo',
    tasks: [
      'Optimize workflows', 'Monitor KPIs', 'Manage vendor relations',
      'Process automation', 'Quality assurance'
    ],
    metrics: [
      { label: 'Tasks/day', value: '156' },
      { label: 'Automation', value: '87%' },
      { label: 'SLA met', value: '99%' },
    ],
  },
  {
    id: 'content', role: 'Content', title: 'Content Creator Tiger',
    desc: 'Generate articles, threads, visuals, and multimedia content at scale',
    icon: FileText, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',
    cubImg: '/images/cubs/prediction.png', defaultBudgetPct: 10, reports: 'cmo',
    tasks: [
      'Write blog posts', 'Create Twitter threads', 'Design infographics',
      'Video scripts', 'Newsletter drafts'
    ],
    metrics: [
      { label: 'Content/week', value: '45' },
      { label: 'Quality score', value: '92' },
      { label: 'Virality', value: '3.1x' },
    ],
  },
  {
    id: 'analytics', role: 'Analytics', title: 'Data Analytics Tiger',
    desc: 'On-chain data analysis, market signals, performance dashboards, and trend forecasting',
    icon: LineChart, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',
    cubImg: '/images/cubs/treasury.png', defaultBudgetPct: 10, reports: 'ceo',
    tasks: [
      'Generate daily reports', 'Track on-chain metrics', 'Forecast trends',
      'Anomaly detection', 'Competitor analysis'
    ],
    metrics: [
      { label: 'Reports/day', value: '8' },
      { label: 'Accuracy', value: '96%' },
      { label: 'Data points', value: '2.4M' },
    ],
  },
];

// ─── Starfield Background ───────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<{ x: number; y: number; z: number; r: number; vx: number; vy: number; color: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let w = 0, h = 0;
    const palette = ['#c084fc', '#a78bfa', '#f0abfc', '#818cf8', '#e879f9'];

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((w * h) / 2000);
      const stars = starsRef.current; stars.length = 0;
      for (let i = 0; i < target; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          z: 0.5 + Math.random() * 1.5, r: 0.3 + Math.random() * 0.8,
          vx: (Math.random() * 0.06 + 0.01) * (Math.random() < 0.5 ? -1 : 1),
          vy: Math.random() * 0.08 + 0.01,
          color: palette[(Math.random() * palette.length) | 0],
        });
      }
    };

    const draw = () => {
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      g.addColorStop(0, 'rgba(88,28,135,0.25)');
      g.addColorStop(0.45, 'rgba(30,27,75,0.35)');
      g.addColorStop(1, 'rgba(2,6,23,0.6)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx * s.z; s.y += s.vy * s.z;
        if (s.x < -5) s.x = w + 5; if (s.x > w + 5) s.x = -5;
        if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w; }
        const t = (Math.sin((Date.now() * 0.002 + i) * s.z) + 1) * 0.5;
        const radius = s.r * (0.7 + t * 0.6);
        ctx.globalAlpha = 0.5 + t * 0.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize(); draw();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />;
}

// ─── Step 1: Mission ────────────────────────────────────────────────────────

function MissionStep({
  swarmName, setSwarmName, mission, setMission,
  selectedAgents, setSelectedAgents,
}: {
  swarmName: string; setSwarmName: (v: string) => void;
  mission: string; setMission: (v: string) => void;
  selectedAgents: string[]; setSelectedAgents: (v: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <img src="/images/cubs/bd.png" alt="Tiger" className="w-12 h-12 rounded-xl" />
        <div>
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Name Your Swarm
          </h3>
          <p className="text-sm text-gray-400">Give your AI enterprise an identity</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Swarm Name</label>
        <input
          value={swarmName}
          onChange={e => setSwarmName(e.target.value)}
          placeholder="e.g. Alpha Trading Collective"
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 font-sans text-sm transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Mission</label>
        <textarea
          value={mission}
          onChange={e => setMission(e.target.value)}
          placeholder="Describe what your swarm will accomplish..."
          rows={3}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 font-sans text-sm resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Templates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { setMission(t.mission); setSwarmName(t.label + ' Swarm'); setSelectedAgents(t.agents); }}
              className="text-left p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-purple-400 group-hover:text-purple-300" />
                <span className="text-sm font-medium text-white">{t.label}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{t.mission}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Hire Agents ────────────────────────────────────────────────────

function HireStep({
  selectedAgents, setSelectedAgents, expandedAgent, setExpandedAgent,
}: {
  selectedAgents: string[]; setSelectedAgents: (v: string[]) => void;
  expandedAgent: string | null; setExpandedAgent: (v: string | null) => void;
}) {
  const toggle = (id: string) => {
    setSelectedAgents(
      selectedAgents.includes(id)
        ? selectedAgents.filter(a => a !== id)
        : [...selectedAgents, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <img src="/images/cubs/content.png" alt="Tiger" className="w-10 h-10 rounded-xl" />
          <div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              Hire Your Team
            </h3>
            <p className="text-xs text-gray-400">{selectedAgents.length} of {AGENTS.length} agents selected</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedAgents(selectedAgents.length === AGENTS.length ? [] : AGENTS.map(a => a.id))}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          {selectedAgents.length === AGENTS.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AGENTS.map(agent => {
          const selected = selectedAgents.includes(agent.id);
          const expanded = expandedAgent === agent.id;
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="relative">
              <button
                onClick={() => toggle(agent.id)}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-200
                  ${selected
                    ? 'bg-white/[0.04] border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                    : 'bg-white/[0.02] border-white/6 hover:border-white/15'
                  }`}
              >
                {/* Checkmark */}
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${selected ? 'bg-purple-500 scale-100' : 'bg-white/5 border border-white/15 scale-90'}`}
                >
                  {selected && <Check size={12} className="text-white" />}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <img src={agent.cubImg} alt={agent.role} className="w-14 h-14 rounded-xl object-contain" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: agent.color }} />
                      <span className="text-sm font-bold text-white">{agent.role}</span>
                    </div>
                    <span className="text-xs text-gray-400 block truncate">{agent.title}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{agent.desc}</p>
              </button>

              {/* Expand for task board */}
              {selected && (
                <button
                  onClick={() => setExpandedAgent(expanded ? null : agent.id)}
                  className="absolute bottom-2 right-3 text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  {expanded ? 'Hide' : 'Tasks'} <ChevronRight size={10} className={expanded ? 'rotate-90' : ''} />
                </button>
              )}

              {/* Notion/Jira-like task board */}
              {expanded && (
                <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 space-y-2 animate-[fadeIn_0.2s_ease]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Task Board</span>
                    <span className="text-[10px] text-gray-500">{agent.tasks.length} tasks</span>
                  </div>
                  {agent.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                      <GripVertical size={10} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                      <div className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-green-400' : i < 4 ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                      <span className="text-xs text-gray-300 flex-1">{task}</span>
                      <span className="text-[9px] text-gray-500 px-1.5 py-0.5 rounded bg-white/5">
                        {i < 2 ? 'Done' : i < 4 ? 'Active' : 'Todo'}
                      </span>
                    </div>
                  ))}

                  {/* Mini analytics */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5">
                    {agent.metrics.map(m => (
                      <div key={m.label} className="text-center">
                        <div className="text-xs font-bold text-white">{m.value}</div>
                        <div className="text-[9px] text-gray-500">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Org Chart (n8n canvas style) ───────────────────────────────────

function OrgChartStep({ selectedAgents }: { selectedAgents: string[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const hired = useMemo(() => AGENTS.filter(a => selectedAgents.includes(a.id)), [selectedAgents]);
  const ceo = hired.find(a => a.id === 'ceo');
  const directReports = hired.filter(a => a.reports === 'ceo' || (!a.reports && a.id !== 'ceo'));
  const subReports = hired.filter(a => a.reports && a.reports !== 'ceo');

  if (hired.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Users size={40} className="mb-4 opacity-30" />
        <p className="text-sm">No agents hired yet. Go back and select agents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <img src="/images/cubs/support.png" alt="Tiger" className="w-10 h-10 rounded-xl" />
        <div>
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Organization Chart
          </h3>
          <p className="text-xs text-gray-400">Live hierarchy with governance rules</p>
        </div>
      </div>

      {/* n8n-style canvas */}
      <div className="relative rounded-xl border border-white/8 bg-[#07090f]/80 p-6 min-h-[300px] overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* CEO Node */}
        {ceo && (
          <div className="relative flex flex-col items-center mb-8">
            <OrgNode agent={ceo} tick={tick} isRoot />

            {/* Lines to reports */}
            {directReports.length > 0 && (
              <div className="w-px h-8 bg-gradient-to-b from-purple-500/40 to-purple-500/10 mt-1" />
            )}
          </div>
        )}

        {/* Direct reports row */}
        {directReports.length > 0 && (
          <div className="relative">
            {/* Horizontal connector */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-purple-500/20"
              style={{ width: `${Math.min(directReports.length * 160, 640)}px` }}
            />

            <div className="flex flex-wrap justify-center gap-4">
              {directReports.map(agent => (
                <div key={agent.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-purple-500/20" />
                  <OrgNode agent={agent} tick={tick} />

                  {/* Sub-reports */}
                  {subReports.filter(s => s.reports === agent.id).map(sub => (
                    <div key={sub.id} className="flex flex-col items-center mt-1">
                      <div className="w-px h-4 bg-purple-500/10" />
                      <OrgNode agent={sub} tick={tick} isLeaf />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Governance rules */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Governance Rules</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { rule: 'Budget changes require CEO approval', icon: Shield },
              { rule: 'Content published after CMO review', icon: FileText },
              { rule: 'Deployments need CTO sign-off', icon: Code },
            ].map((g, i) => {
              const GIcon = g.icon;
              return (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <GIcon size={10} className="text-purple-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-400">{g.rule}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgNode({ agent, tick, isRoot = false, isLeaf = false }: { agent: AgentRole; tick: number; isRoot?: boolean; isLeaf?: boolean }) {
  const heartbeat = tick % 3 === 0;
  const Icon = agent.icon;
  return (
    <div className={`relative flex items-center gap-3 rounded-xl border px-3 py-2
      ${isRoot ? 'bg-white/[0.05] border-yellow-500/30' : 'bg-white/[0.03] border-white/8'}
      ${isLeaf ? 'scale-90' : ''}
      transition-all duration-300 hover:border-purple-500/30 group`}
    >
      <img src={agent.cubImg} alt={agent.role} className="w-8 h-8 rounded-lg object-contain" />
      <div>
        <div className="flex items-center gap-1.5">
          <Icon size={10} style={{ color: agent.color }} />
          <span className="text-xs font-bold text-white">{agent.role}</span>
          {isRoot && <Crown size={10} className="text-yellow-400" />}
        </div>
        <span className="text-[10px] text-gray-500">{agent.title}</span>
      </div>

      {/* Heartbeat indicator */}
      <div className="ml-auto flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full transition-all duration-500
          ${heartbeat ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)] scale-110' : 'bg-green-400/60 scale-100'}`}
        />
      </div>
    </div>
  );
}

// ─── Step 4: Budget ─────────────────────────────────────────────────────────

function BudgetStep({
  selectedAgents, budget, setBudget, budgetSplits, setBudgetSplits,
}: {
  selectedAgents: string[];
  budget: number; setBudget: (v: number) => void;
  budgetSplits: Record<string, number>; setBudgetSplits: (v: Record<string, number>) => void;
}) {
  const hired = useMemo(() => AGENTS.filter(a => selectedAgents.includes(a.id)), [selectedAgents]);

  // Auto-split when agents change
  useEffect(() => {
    const totalPct = hired.reduce((s, a) => s + a.defaultBudgetPct, 0);
    const splits: Record<string, number> = {};
    hired.forEach(a => { splits[a.id] = Math.round((a.defaultBudgetPct / totalPct) * 100); });
    setBudgetSplits(splits);
  }, [selectedAgents.join(',')]);

  const adjustSplit = (id: string, delta: number) => {
    const next = { ...budgetSplits };
    const newVal = Math.max(5, Math.min(60, (next[id] || 0) + delta));
    const diff = newVal - (next[id] || 0);
    next[id] = newVal;

    // Redistribute from others
    const others = Object.keys(next).filter(k => k !== id);
    const totalOthers = others.reduce((s, k) => s + next[k], 0);
    others.forEach(k => {
      next[k] = Math.max(5, Math.round(next[k] - (diff * next[k]) / totalOthers));
    });

    // Ensure total = 100
    const total = Object.values(next).reduce((s, v) => s + v, 0);
    if (total !== 100 && others.length > 0) {
      next[others[0]] += (100 - total);
    }

    setBudgetSplits(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <img src="/images/cubs/treasury.png" alt="Tiger" className="w-10 h-10 rounded-xl" />
        <div>
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Set Your Budget
          </h3>
          <p className="text-xs text-gray-400">Allocate resources across your agents</p>
        </div>
      </div>

      {/* Budget slider */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Monthly Budget</span>
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              {budget}
            </span>
          </div>
        </div>
        <input
          type="range" min={50} max={1000} step={10} value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>$50</span><span>$500</span><span>$1,000</span>
        </div>
      </div>

      {/* Agent budget splits */}
      <div className="space-y-2">
        {hired.map(agent => {
          const pct = budgetSplits[agent.id] || 0;
          const amount = Math.round(budget * pct / 100);
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/[0.02]">
              <img src={agent.cubImg} alt={agent.role} className="w-8 h-8 rounded-lg object-contain" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={10} style={{ color: agent.color }} />
                  <span className="text-xs font-bold text-white">{agent.role}</span>
                  <span className="ml-auto text-xs font-mono text-gray-400">${amount}/mo</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${agent.color}88, ${agent.color})`,
                      boxShadow: `0 0 8px ${agent.color}40`,
                    }}
                  />
                </div>
              </div>
              {/* +/- controls */}
              <div className="flex items-center gap-1">
                <button onClick={() => adjustSplit(agent.id, -5)}
                  className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <Minus size={10} className="text-gray-400" />
                </button>
                <span className="text-[10px] font-mono text-gray-300 w-7 text-center">{pct}%</span>
                <button onClick={() => adjustSplit(agent.id, 5)}
                  className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <Plus size={10} className="text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5: Launch ─────────────────────────────────────────────────────────

function LaunchStep({
  selectedAgents, swarmName, isDeploying, isDeployed, onDeploy,
}: {
  selectedAgents: string[];
  swarmName: string;
  isDeploying: boolean;
  isDeployed: boolean;
  onDeploy: () => void;
}) {
  const hired = useMemo(() => AGENTS.filter(a => selectedAgents.includes(a.id)), [selectedAgents]);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployingAgent, setDeployingAgent] = useState(0);

  useEffect(() => {
    if (!isDeploying) return;
    const interval = setInterval(() => {
      setDeployProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isDeploying]);

  useEffect(() => {
    if (!isDeploying) return;
    const interval = setInterval(() => {
      setDeployingAgent(a => (a + 1) % hired.length);
    }, 500);
    return () => clearInterval(interval);
  }, [isDeploying, hired.length]);

  if (isDeployed) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-[fadeIn_0.5s_ease]">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
            <Check size={40} className="text-green-400" />
          </div>
          <div className="absolute -inset-3 rounded-full border border-green-500/10 animate-ping" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Swarm Deployed!
        </h3>
        <p className="text-sm text-gray-400 mb-8 max-w-sm">
          {swarmName || 'Your swarm'} is now live with {hired.length} agents working autonomously.
        </p>

        {/* Deployed agents grid */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {hired.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-green-500/20 animate-[fadeIn_0.3s_ease]"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <img src={agent.cubImg} alt={agent.role} className="w-8 h-8 rounded-lg object-contain" />
                <div>
                  <div className="flex items-center gap-1">
                    <Icon size={10} style={{ color: agent.color }} />
                    <span className="text-xs font-bold text-white">{agent.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]" />
                    <span className="text-[10px] text-green-400">Online</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img src="/images/tiger.png" alt="Tiger" className="w-12 h-12 rounded-xl" />
        <div>
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {isDeploying ? 'Deploying Swarm...' : 'Ready to Launch'}
          </h3>
          <p className="text-xs text-gray-400">
            {isDeploying ? 'Initializing agent nodes...' : `${hired.length} agents configured and ready`}
          </p>
        </div>
      </div>

      {isDeploying ? (
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Deployment Progress</span>
              <span className="font-mono">{Math.min(deployProgress, 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100"
                style={{ width: `${Math.min(deployProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Agent deploy sequence */}
          <div className="space-y-2">
            {hired.map((agent, i) => {
              const done = deployProgress > ((i + 1) / hired.length) * 100;
              const active = i === deployingAgent && !done;
              const Icon = agent.icon;
              return (
                <div key={agent.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
                    ${done ? 'border-green-500/20 bg-green-500/[0.03]'
                      : active ? 'border-purple-500/30 bg-purple-500/[0.03]'
                      : 'border-white/5 bg-white/[0.01]'}`}
                >
                  <img src={agent.cubImg} alt={agent.role} className="w-8 h-8 rounded-lg object-contain" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={10} style={{ color: agent.color }} />
                      <span className="text-xs font-bold text-white">{agent.role}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {done ? 'Deployed' : active ? 'Initializing...' : 'Pending'}
                    </span>
                  </div>
                  {done ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={10} className="text-green-400" />
                    </div>
                  ) : active ? (
                    <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Pre-launch summary */
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Launch Summary</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Swarm Name</div>
              <div className="text-sm font-medium text-white truncate">{swarmName || 'Unnamed Swarm'}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Agents</div>
              <div className="text-sm font-medium text-white">{hired.length} agents</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hired.map(agent => {
              const Icon = agent.icon;
              return (
                <div key={agent.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                  <img src={agent.cubImg} alt={agent.role} className="w-5 h-5 rounded object-contain" />
                  <Icon size={10} style={{ color: agent.color }} />
                  <span className="text-[11px] text-gray-300">{agent.role}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={onDeploy}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_24px_rgba(139,92,246,0.3)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Rocket size={16} />
            Deploy Swarm
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export default function SwarmCreationModal() {
  const { flowGateOpen, setFlowGateOpen, setPickerOpen, setFormOpen } = useAgentCart();
  const setFormData = useAgentFormStore(s => s.setData);
  const { publicKey } = useWallet();

  const [step, setStep] = useState<StepId>('mission');
  const [swarmName, setSwarmName] = useState('');
  const [mission, setMission] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [budget, setBudget] = useState(250);
  const [budgetSplits, setBudgetSplits] = useState<Record<string, number>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!flowGateOpen) return null;

  const stepIdx = STEPS.findIndex(s => s.id === step);
  const canGoNext = () => {
    if (step === 'mission') return swarmName.trim().length > 0 && mission.trim().length > 0;
    if (step === 'hire') return selectedAgents.length >= 2;
    if (step === 'orgchart') return true;
    if (step === 'budget') return budget >= 50;
    return false;
  };

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1].id);
  };

  const goBack = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].id);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);

    // Save to form store
    setFormData({
      name: swarmName,
      masterPrompt: mission,
      selectedAgents,
    });

    // Simulate deployment (replace with real API call)
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
    }, 3500);
  };

  const handleClose = () => {
    setFlowGateOpen(false);
    // Reset state
    setStep('mission');
    setSwarmName('');
    setMission('');
    setSelectedAgents([]);
    setBudget(250);
    setIsDeploying(false);
    setIsDeployed(false);
    setExpandedAgent(null);
  };

  return (
    <>
      <Starfield />

      <div
        className="fixed inset-0 z-[110] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto overscroll-contain"
        style={{ touchAction: 'pan-y' }}
        onClick={handleClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div
          className="relative z-[120] w-full max-w-3xl bg-[#0a0d17]/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden my-4 md:my-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.3)]">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Create Agent Swarm
                </h2>
                <p className="text-[10px] text-gray-500">Zero Employee Enterprise</p>
              </div>
            </div>
            <button onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-5 py-3 border-b border-white/5 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {STEPS.map((s, i) => {
                const active = s.id === step;
                const done = i < stepIdx;
                const StepIcon = s.icon;
                return (
                  <React.Fragment key={s.id}>
                    {i > 0 && (
                      <div className={`w-6 md:w-10 h-px flex-shrink-0 ${done ? 'bg-purple-500/40' : 'bg-white/8'}`} />
                    )}
                    <button
                      onClick={() => { if (done) setStep(s.id); }}
                      disabled={!done && !active}
                      className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all whitespace-nowrap flex-shrink-0
                        ${active ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : done ? 'text-purple-400 hover:bg-white/5 cursor-pointer'
                          : 'text-gray-600'}`}
                    >
                      {done ? (
                        <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center">
                          <Check size={8} className="text-purple-300" />
                        </div>
                      ) : (
                        <StepIcon size={12} />
                      )}
                      {(!isMobile || active) && <span>{s.label}</span>}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5 max-h-[60vh] overflow-y-auto">
            {step === 'mission' && (
              <MissionStep
                swarmName={swarmName} setSwarmName={setSwarmName}
                mission={mission} setMission={setMission}
                selectedAgents={selectedAgents} setSelectedAgents={setSelectedAgents}
              />
            )}
            {step === 'hire' && (
              <HireStep
                selectedAgents={selectedAgents} setSelectedAgents={setSelectedAgents}
                expandedAgent={expandedAgent} setExpandedAgent={setExpandedAgent}
              />
            )}
            {step === 'orgchart' && <OrgChartStep selectedAgents={selectedAgents} />}
            {step === 'budget' && (
              <BudgetStep
                selectedAgents={selectedAgents}
                budget={budget} setBudget={setBudget}
                budgetSplits={budgetSplits} setBudgetSplits={setBudgetSplits}
              />
            )}
            {step === 'launch' && (
              <LaunchStep
                selectedAgents={selectedAgents}
                swarmName={swarmName}
                isDeploying={isDeploying}
                isDeployed={isDeployed}
                onDeploy={handleDeploy}
              />
            )}
          </div>

          {/* Footer navigation */}
          {!isDeployed && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <button
                onClick={goBack}
                disabled={stepIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Back
              </button>

              <div className="flex items-center gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all
                    ${i === stepIdx ? 'bg-purple-400 w-4' : i < stepIdx ? 'bg-purple-500/40' : 'bg-white/10'}`}
                  />
                ))}
              </div>

              {step !== 'launch' ? (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_16px_rgba(139,92,246,0.2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              ) : (
                <div /> /* Deploy button is inside the step */
              )}
            </div>
          )}

          {/* Done footer */}
          {isDeployed && (
            <div className="flex items-center justify-center px-5 py-4 border-t border-white/5">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 transition-all"
              >
                Done — Return to Terminal
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
