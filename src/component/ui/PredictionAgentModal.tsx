'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Bot, Wallet, Shield, Settings, ChevronRight, ChevronLeft,
  Check, AlertTriangle, Loader2, Eye, EyeOff, TrendingUp,
  Zap, Lock, BarChart2, ArrowRight, ArrowDown, Cpu,
  Globe, Database, LineChart, Radio
} from 'lucide-react'
import { z } from 'zod'
import { useWallet } from '@solana/wallet-adapter-react'

// ─── Validation ───
const KEY_CHARS = /^[A-Za-z0-9_-]+$/
const HEX40 = /^[0-9a-fA-F]{40}$/
const HEX40_WITH_0X = /^0x[0-9a-fA-F]{40}$/

const KeySchema = z.string().trim()
  .length(66, 'Must be exactly 66 characters.')
  .regex(KEY_CHARS, 'Invalid characters.')

const WalletSchema = z.string().trim()
  .transform(v => (HEX40.test(v) && !v.startsWith('0x') ? `0x${v}` : v))
  .refine(v => HEX40_WITH_0X.test(v), 'Wallet must be 0x + 40 hex (42 chars).')

const CredsSchema = z.object({
  wallet: WalletSchema,
  apiKey: KeySchema,
  apiAddr: z.string().trim().min(1, 'Required'),
})

const RiskCfgSchema = z.object({
  capitalUsage: z.string().trim().refine(v => {
    const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 1
  }, 'Enter a decimal between 0 and 1'),
  maxLeverage: z.string().trim().refine(v => {
    const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5
  }, 'Enter an integer 1–5'),
  minNotional: z.string().trim().refine(v => {
    const n = Number(v); return Number.isFinite(n) && n >= 1 && n <= 100
  }, 'Enter a number between 1 and 100'),
  enable: z.boolean(),
})

interface PredictionAgentModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Overview', icon: Bot },
  { num: 2, label: 'Credentials', icon: Wallet },
  { num: 3, label: 'Risk Config', icon: Settings },
  { num: 4, label: 'Review', icon: Check },
]

const PredictionAgentModal: React.FC<PredictionAgentModalProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet()
  const userId = useMemo(() => publicKey?.toBase58() || '', [publicKey])

  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

  const [creds, setCreds] = useState({ wallet: '', apiKey: '', apiAddr: '' })
  const [cfg, setCfg] = useState({ capitalUsage: '', maxLeverage: '', minNotional: '', enable: false })

  const [credsErrors, setCredsErrors] = useState<Record<string, string>>({})
  const [cfgErrors, setCfgErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSetupComplete(false)
      setCreds({ wallet: '', apiKey: '', apiAddr: '' })
      setCfg({ capitalUsage: '', maxLeverage: '', minNotional: '', enable: false })
      setCredsErrors({})
      setCfgErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateStep2 = (): boolean => {
    setCredsErrors({})
    const result = CredsSchema.safeParse(creds)
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors
      setCredsErrors({
        wallet: fe.wallet?.[0] || '',
        apiKey: fe.apiKey?.[0] || '',
        apiAddr: fe.apiAddr?.[0] || '',
      })
      return false
    }
    setCreds(result.data)
    return true
  }

  const validateStep3 = (): boolean => {
    setCfgErrors({})
    const parsed = RiskCfgSchema.safeParse(cfg)
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors
      setCfgErrors({
        capitalUsage: fe.capitalUsage?.[0] || '',
        maxLeverage: fe.maxLeverage?.[0] || '',
        minNotional: fe.minNotional?.[0] || '',
      })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    if (step < 4) setStep((step + 1) as Step)
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleSubmit = async () => {
    if (!userId) {
      setToast({ type: 'error', msg: 'Connect your Solana wallet first.' })
      return
    }

    const parsed = RiskCfgSchema.safeParse(cfg)
    if (!parsed.success) return

    setSubmitting(true)
    try {
      const body = {
        userId,
        HL_MAIN_PK: creds.apiKey,
        HL_MAIN_ADDR: creds.wallet,
        HL_API_PK: creds.apiKey,
        HL_API_ADDR: creds.apiAddr,
        CAPITAL_USAGE: Number(parsed.data.capitalUsage),
        MAX_LEVERAGE: Number(parsed.data.maxLeverage),
        MIN_NOTIONAL: Number(parsed.data.minNotional),
        enable: parsed.data.enable ?? false,
      }

      const res = await fetch('/api/bot/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Setup failed')

      setSetupComplete(true)
      setToast({ type: 'success', msg: 'Prediction agent configured successfully!' })
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', msg: 'Failed to configure prediction agent.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: "'DM Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#ef4444',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    marginBottom: 4,
    display: 'block',
  }

  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560,
        background: 'linear-gradient(145deg, rgba(15,17,28,0.98), rgba(11,13,22,0.98))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
        color: '#e2e8f0',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: 16, right: 16, zIndex: 10000,
            padding: '10px 18px', borderRadius: 10,
            background: toast.type === 'success' ? '#34d399' : '#ef4444',
            color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c6af7, #4338ca)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,106,247,0.3)',
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Syne', sans-serif" }}>
                Prediction Agent Setup
              </h2>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                Step {step} of 4
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', cursor: 'pointer',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Step Progress */}
        <div style={{ display: 'flex', padding: '16px 24px', gap: 4 }}>
          {STEPS.map(s => (
            <div key={s.num} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: '100%', height: 3, borderRadius: 2,
                background: s.num <= step ? '#7c6af7' : 'rgba(255,255,255,0.06)',
                transition: 'background 0.3s',
              }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: s.num <= step ? '#a78bfa' : '#6b7280',
                fontWeight: s.num === step ? 600 : 400,
              }}>
                <s.icon size={10} />
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '8px 24px 24px' }}>

          {/* ─── STEP 1: Overview ─── */}
          {step === 1 && (
            <div>
              {/* Brief intro */}
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 20px' }}>
                The Prediction Agent is an autonomous trading bot powered by ZkAGI&apos;s
                foundational model. Here&apos;s how the pipeline works:
              </p>

              {/* ─── Animated Architecture Flow Diagram ─── */}
              <div style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '20px 16px',
                marginBottom: 20, position: 'relative', overflow: 'hidden',
              }}>
                {/* Label */}
                <div style={{
                  textAlign: 'center', marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#4b5563',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '4px 12px', borderRadius: 6,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    System Architecture
                  </span>
                </div>

                {/* Row 1: Data Sources */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
                  marginBottom: 4,
                }}>
                  {[
                    { icon: Globe, label: 'Market Data', sub: 'Real-time prices', color: '#34d399' },
                    { icon: Radio, label: 'News Feed', sub: 'Sentiment analysis', color: '#60a5fa' },
                    { icon: LineChart, label: 'Price Forecast', sub: 'BTC / ETH / SOL', color: '#f59e0b' },
                  ].map((node, i) => (
                    <div key={node.label} style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: `1px solid ${node.color}25`,
                      borderRadius: 10, padding: '12px 10px',
                      textAlign: 'center',
                      animation: `fadeSlideUp 0.5s ${i * 0.1}s both`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, margin: '0 auto 6px',
                        background: `${node.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <node.icon size={14} color={node.color} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', fontFamily: "'DM Mono', monospace" }}>
                        {node.label}
                      </div>
                      <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{node.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Connector: three lines merging into one */}
                <div style={{ position: 'relative', height: 32, margin: '0 0 4px' }}>
                  {/* Three vertical lines from each source */}
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `${16.66 + i * 33.33}%`,
                      top: 0, width: 1, height: 16,
                      background: 'rgba(124,106,247,0.3)',
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, left: -1, width: 3, height: '100%',
                        background: '#7c6af7',
                        animation: `flowDown 1.5s ${0.6 + i * 0.15}s infinite`,
                        opacity: 0,
                      }} />
                    </div>
                  ))}
                  {/* Horizontal merge line */}
                  <div style={{
                    position: 'absolute', top: 16,
                    left: '16.66%', right: '16.66%',
                    height: 1, background: 'rgba(124,106,247,0.3)',
                  }} />
                  {/* Single line down from center */}
                  <div style={{
                    position: 'absolute', left: '50%', top: 16,
                    width: 1, height: 16,
                    background: 'rgba(124,106,247,0.3)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: -1, width: 3, height: '100%',
                      background: '#7c6af7',
                      animation: 'flowDown 1.5s 1s infinite',
                      opacity: 0,
                    }} />
                  </div>
                </div>

                {/* Row 2: ZkAGI Engine */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(67,56,202,0.08))',
                  border: '1px solid rgba(124,106,247,0.2)',
                  borderRadius: 12, padding: '14px 16px',
                  textAlign: 'center', marginBottom: 4,
                  animation: 'fadeSlideUp 0.5s 0.4s both',
                  position: 'relative',
                }}>
                  {/* Pulsing glow */}
                  <div style={{
                    position: 'absolute', inset: -1, borderRadius: 12,
                    background: 'transparent',
                    boxShadow: '0 0 20px rgba(124,106,247,0.15)',
                    animation: 'pulseGlow 2s infinite',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Cpu size={16} color="#a78bfa" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', fontFamily: "'DM Mono', monospace" }}>
                      ZkAGI Foundational Model
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap',
                  }}>
                    {['signal_gen', 'risk_eval', 'entry_exit', 'confidence'].map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontFamily: "'DM Mono', monospace",
                        padding: '3px 8px', borderRadius: 5,
                        background: 'rgba(124,106,247,0.12)',
                        border: '1px solid rgba(124,106,247,0.2)',
                        color: '#c4b5fd',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector down */}
                <div style={{
                  width: 1, height: 24, margin: '0 auto', position: 'relative',
                  background: 'rgba(52,211,153,0.3)',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: -1, width: 3, height: '100%',
                    background: '#34d399',
                    animation: 'flowDown 1.5s 1.4s infinite',
                    opacity: 0,
                  }} />
                </div>

                {/* Row 3: Risk + TEE */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                  marginBottom: 4,
                }}>
                  <div style={{
                    background: 'rgba(245,158,11,0.05)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: 10, padding: '12px',
                    textAlign: 'center',
                    animation: 'fadeSlideUp 0.5s 0.7s both',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                      <Shield size={13} color="#f59e0b" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', fontFamily: "'DM Mono', monospace" }}>
                        Risk Engine
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      Capital limits, leverage caps, notional floor
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(96,165,250,0.05)',
                    border: '1px solid rgba(96,165,250,0.15)',
                    borderRadius: 10, padding: '12px',
                    textAlign: 'center',
                    animation: 'fadeSlideUp 0.5s 0.8s both',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                      <Lock size={13} color="#60a5fa" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#93c5fd', fontFamily: "'DM Mono', monospace" }}>
                        TEE Secure
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      Encrypted keys in trusted execution
                    </div>
                  </div>
                </div>

                {/* Connector down */}
                <div style={{
                  width: 1, height: 24, margin: '0 auto', position: 'relative',
                  background: 'rgba(52,211,153,0.3)',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: -1, width: 3, height: '100%',
                    background: '#34d399',
                    animation: 'flowDown 1.5s 1.8s infinite',
                    opacity: 0,
                  }} />
                </div>

                {/* Row 4: Execution */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(5,150,105,0.06))',
                  border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: 12, padding: '14px 16px',
                  textAlign: 'center',
                  animation: 'fadeSlideUp 0.5s 1s both',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Zap size={16} color="#34d399" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7', fontFamily: "'DM Mono', monospace" }}>
                      HyperLiquid Execution
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(52,211,153,0.15)',
                      color: '#34d399', fontFamily: "'DM Mono', monospace",
                    }}>
                      hourly UTC
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap',
                  }}>
                    {['start', 'stop', 'trade_once'].map(action => (
                      <span key={action} style={{
                        fontSize: 10, fontFamily: "'DM Mono', monospace",
                        padding: '3px 8px', borderRadius: 5,
                        background: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.15)',
                        color: '#6ee7b7',
                      }}>
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wallet warning */}
              {!userId && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10,
                }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <span style={{ fontSize: 12, color: '#f59e0b' }}>
                    Connect your Solana wallet to proceed with setup.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: Credentials ─── */}
          {step === 2 && (
            <div>
              <div style={{
                background: 'rgba(96,165,250,0.06)',
                border: '1px solid rgba(96,165,250,0.15)',
                borderRadius: 14, padding: '14px 16px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Wallet size={14} color="#60a5fa" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>HyperLiquid Connection</span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Enter your HyperLiquid wallet address and API credentials.
                  These are used to execute trades on your behalf. You can generate API keys from
                  your HyperLiquid account settings.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Wallet */}
                <div>
                  <label style={labelStyle}>HyperLiquid Wallet Address</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Your EVM wallet address (0x + 40 hex characters)
                  </p>
                  <input
                    value={creds.wallet}
                    onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
                    style={credsErrors.wallet ? inputErrorStyle : inputStyle}
                    placeholder="0x1234...abcd"
                  />
                  {credsErrors.wallet && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{credsErrors.wallet}</p>
                  )}
                </div>

                {/* API Key */}
                <div>
                  <label style={labelStyle}>API Key (HL_API_PK)</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Your HyperLiquid API private key (66 characters)
                  </p>
                  <input
                    value={creds.apiKey}
                    onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
                    style={credsErrors.apiKey ? inputErrorStyle : inputStyle}
                    placeholder="0x..."
                  />
                  {credsErrors.apiKey && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{credsErrors.apiKey}</p>
                  )}
                </div>

                {/* API Address */}
                <div>
                  <label style={labelStyle}>API Wallet Address (HL_API_ADDR)</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    The wallet address associated with your API key
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={creds.apiAddr}
                      onChange={e => setCreds(s => ({ ...s, apiAddr: e.target.value.trim() }))}
                      style={{ ...(credsErrors.apiAddr ? inputErrorStyle : inputStyle), flex: 1 }}
                      placeholder="0x..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(v => !v)}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6b7280', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {credsErrors.apiAddr && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{credsErrors.apiAddr}</p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(124,106,247,0.06)',
                border: '1px solid rgba(124,106,247,0.12)',
                borderRadius: 10,
              }}>
                <Lock size={12} color="#a78bfa" />
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  Credentials are stored on a TEE (Trusted Execution Environment) for security.
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Risk Config ─── */}
          {step === 3 && (
            <div>
              <div style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 14, padding: '14px 16px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Settings size={14} color="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>Risk Configuration</span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Configure how much of your capital the bot can use, leverage limits,
                  and minimum trade size. These controls protect you from excessive exposure.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Capital Usage */}
                <div>
                  <label style={labelStyle}>Capital Usage</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Fraction of your total balance to use (0 to 1, e.g. 0.3 = 30%)
                  </p>
                  <input
                    inputMode="decimal"
                    value={cfg.capitalUsage}
                    onChange={e => setCfg(s => ({ ...s, capitalUsage: e.target.value }))}
                    style={cfgErrors.capitalUsage ? inputErrorStyle : inputStyle}
                    placeholder="0.3"
                  />
                  {cfgErrors.capitalUsage && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{cfgErrors.capitalUsage}</p>
                  )}
                </div>

                {/* Max Leverage */}
                <div>
                  <label style={labelStyle}>Max Leverage</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Maximum leverage multiplier (1-5x). Higher leverage = higher risk.
                  </p>
                  <input
                    inputMode="numeric"
                    value={cfg.maxLeverage}
                    onChange={e => setCfg(s => ({ ...s, maxLeverage: e.target.value }))}
                    style={cfgErrors.maxLeverage ? inputErrorStyle : inputStyle}
                    placeholder="3"
                  />
                  {cfgErrors.maxLeverage && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{cfgErrors.maxLeverage}</p>
                  )}
                </div>

                {/* Min Notional */}
                <div>
                  <label style={labelStyle}>Minimum Notional (USD)</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Minimum trade size in USD (1-100). Trades below this are skipped.
                  </p>
                  <input
                    inputMode="decimal"
                    value={cfg.minNotional}
                    onChange={e => setCfg(s => ({ ...s, minNotional: e.target.value }))}
                    style={cfgErrors.minNotional ? inputErrorStyle : inputStyle}
                    placeholder="20"
                  />
                  {cfgErrors.minNotional && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{cfgErrors.minNotional}</p>
                  )}
                </div>

                {/* Enable Toggle */}
                <div>
                  <label style={labelStyle}>Auto-Start</label>
                  <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 6px' }}>
                    Enable the bot immediately after setup, or start it manually later from the dashboard.
                  </p>
                  <button
                    onClick={() => setCfg(s => ({ ...s, enable: !s.enable }))}
                    type="button"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                      background: cfg.enable ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${cfg.enable ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      color: cfg.enable ? '#34d399' : '#6b7280',
                      fontSize: 13, fontWeight: 500, width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 20, borderRadius: 10,
                      background: cfg.enable ? '#34d399' : 'rgba(255,255,255,0.1)',
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 8,
                        background: '#fff',
                        position: 'absolute', top: 2,
                        left: cfg.enable ? 18 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    {cfg.enable ? 'Bot will start automatically' : 'Bot will remain stopped'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Review ─── */}
          {step === 4 && !setupComplete && (
            <div>
              <div style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: 14, padding: '14px 16px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Check size={14} color="#34d399" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7' }}>Review Configuration</span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Verify your settings below before activating the prediction agent.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Credentials Summary */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wallet size={13} color="#60a5fa" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>Credentials</span>
                    </div>
                    <button onClick={() => setStep(2)} style={{
                      fontSize: 11, color: '#7c6af7', cursor: 'pointer',
                      background: 'none', border: 'none', textDecoration: 'underline',
                    }}>Edit</button>
                  </div>
                  {[
                    { label: 'Wallet', value: `${creds.wallet.slice(0, 6)}...${creds.wallet.slice(-4)}` },
                    { label: 'API Key', value: `${creds.apiKey.slice(0, 8)}...${creds.apiKey.slice(-4)}` },
                    { label: 'API Address', value: creds.apiAddr ? `${creds.apiAddr.slice(0, 6)}...` : '—' },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                    }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: '#e2e8f0' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Risk Summary */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Settings size={13} color="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Risk Config</span>
                    </div>
                    <button onClick={() => setStep(3)} style={{
                      fontSize: 11, color: '#7c6af7', cursor: 'pointer',
                      background: 'none', border: 'none', textDecoration: 'underline',
                    }}>Edit</button>
                  </div>
                  {[
                    { label: 'Capital Usage', value: `${(Number(cfg.capitalUsage) * 100).toFixed(0)}%` },
                    { label: 'Max Leverage', value: `${cfg.maxLeverage}x` },
                    { label: 'Min Notional', value: `$${cfg.minNotional}` },
                    { label: 'Auto-Start', value: cfg.enable ? 'Yes' : 'No' },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                    }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: '#e2e8f0' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Setup Complete ─── */}
          {step === 4 && setupComplete && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={28} color="#34d399" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
                Agent Configured!
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                Your prediction agent has been set up successfully.
                {cfg.enable
                  ? ' The bot will start trading automatically.'
                  : ' You can start it from the Prediction Dashboard.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={onClose} style={{
                  padding: '10px 24px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Close
                </button>
                <button onClick={() => {
                  onClose()
                  window.location.href = `/${(window as any).__NEXT_DATA__?.query?.lang || 'en'}/predictions`
                }} style={{
                  padding: '10px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #7c6af7, #4338ca)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <BarChart2 size={14} />
                  Open Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!(step === 4 && setupComplete) && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={step === 1 ? onClose : handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9ca3af', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {step === 1 ? (
                'Cancel'
              ) : (
                <><ChevronLeft size={14} /> Back</>
              )}
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !userId}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 10,
                  background: (step === 1 && !userId)
                    ? 'rgba(124,106,247,0.3)' : 'linear-gradient(135deg, #7c6af7, #4338ca)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: (step === 1 && !userId) ? 'not-allowed' : 'pointer',
                  opacity: (step === 1 && !userId) ? 0.5 : 1,
                  boxShadow: '0 0 20px rgba(124,106,247,0.2)',
                }}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 10,
                  background: submitting
                    ? 'rgba(124,106,247,0.3)' : 'linear-gradient(135deg, #7c6af7, #4338ca)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 0 20px rgba(124,106,247,0.2)',
                }}
              >
                {submitting ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Setting up...</>
                ) : (
                  <><Zap size={14} /> Activate Agent</>
                )}
              </button>
            )}
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes flowDown {
            0% { opacity: 0; transform: translateY(-100%); }
            30% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; transform: translateY(100%); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(124,106,247,0.1); }
            50% { box-shadow: 0 0 24px rgba(124,106,247,0.25); }
          }
        `}</style>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default PredictionAgentModal
