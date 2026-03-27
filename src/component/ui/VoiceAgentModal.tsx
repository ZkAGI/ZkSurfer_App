'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Mic, Volume2, Upload, Trash2, Play, Pause, ChevronRight, ChevronLeft,
  Check, Loader2, AlertTriangle, Radio, Cpu, ArrowDown, Headphones,
  FileAudio, List, Plus, RefreshCw, Download, Copy, Settings, Layers, Zap
} from 'lucide-react'

const VOICE_API = 'https://avatar.zkagi.ai'

interface VoiceProfile {
  voice_id: string
  name: string
  ref_text?: string
  metadata?: Record<string, unknown>
}

interface VoiceAgentModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Overview', icon: Mic },
  { num: 2, label: 'Register', icon: Upload },
  { num: 3, label: 'Voices', icon: List },
  { num: 4, label: 'Speak', icon: Volume2 },
]

type TtsMode = 'standard' | 'clone' | 'batch'

const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>(1)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Register state
  const [voiceId, setVoiceId] = useState('')
  const [voiceName, setVoiceName] = useState('')
  const [refText, setRefText] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [registerMode, setRegisterMode] = useState<'file' | 'url'>('file')
  const [registering, setRegistering] = useState(false)

  // Voices list
  const [voices, setVoices] = useState<VoiceProfile[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // TTS state
  const [ttsMode, setTtsMode] = useState<TtsMode>('standard')
  const [ttsVoiceId, setTtsVoiceId] = useState('')
  const [ttsText, setTtsText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [audioResult, setAudioResult] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cloneFileRef = useRef<HTMLInputElement>(null)

  // Clone TTS state
  const [cloneAudioFile, setCloneAudioFile] = useState<File | null>(null)
  const [cloneRefText, setCloneRefText] = useState('')

  // Batch TTS state
  const [batchItems, setBatchItems] = useState([{ id: '1', text: '' }, { id: '2', text: '' }])
  const [batchResults, setBatchResults] = useState<Array<{ id: string; audio?: string; error?: string }>>([])

  // API health
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setVoiceId('')
      setVoiceName('')
      setRefText('')
      setAudioFile(null)
      setAudioUrl('')
      setAudioResult(null)
      setTtsText('')
      setTtsVoiceId('')
      setCloneAudioFile(null)
      setCloneRefText('')
      setBatchItems([{ id: '1', text: '' }, { id: '2', text: '' }])
      setBatchResults([])
      checkHealth()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && (step === 3 || step === 4)) {
      fetchVoices()
    }
  }, [isOpen, step])

  // ─── API: GET /health ───
  const checkHealth = async () => {
    try {
      const res = await fetch(`${VOICE_API}/health`)
      setApiHealthy(res.ok)
    } catch {
      setApiHealthy(false)
    }
  }

  // ─── API: GET /v1/voices ───
  const fetchVoices = async () => {
    setLoadingVoices(true)
    try {
      const res = await fetch(`${VOICE_API}/v1/voices`)
      if (!res.ok) throw new Error('Failed to fetch voices')
      const data = await res.json()
      setVoices(Array.isArray(data) ? data : data.voices || [])
    } catch {
      setToast({ type: 'error', msg: 'Failed to load voice profiles.' })
    } finally {
      setLoadingVoices(false)
    }
  }

  // ─── API: POST /v1/voices/register & POST /v1/voices/register-url ───
  const handleRegister = async () => {
    if (!voiceId.trim() || !voiceName.trim() || !refText.trim()) {
      setToast({ type: 'error', msg: 'Voice ID, name, and reference text are required.' })
      return
    }
    if (registerMode === 'file' && !audioFile) {
      setToast({ type: 'error', msg: 'Please select an audio file.' })
      return
    }
    if (registerMode === 'url' && !audioUrl.trim()) {
      setToast({ type: 'error', msg: 'Please enter an audio URL.' })
      return
    }

    setRegistering(true)
    try {
      let res: Response
      if (registerMode === 'file') {
        const fd = new FormData()
        fd.append('voice_id', voiceId.trim())
        fd.append('name', voiceName.trim())
        fd.append('ref_audio', audioFile!)
        fd.append('ref_text', refText.trim())
        res = await fetch(`${VOICE_API}/v1/voices/register`, { method: 'POST', body: fd })
      } else {
        res = await fetch(`${VOICE_API}/v1/voices/register-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voice_id: voiceId.trim(),
            name: voiceName.trim(),
            audio_url: audioUrl.trim(),
            ref_text: refText.trim(),
          }),
        })
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Registration failed')
      }
      setToast({ type: 'success', msg: `Voice "${voiceName}" registered!` })
      setVoiceId('')
      setVoiceName('')
      setRefText('')
      setAudioFile(null)
      setAudioUrl('')
      setStep(3)
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message || 'Failed to register voice.' })
    } finally {
      setRegistering(false)
    }
  }

  // ─── API: DELETE /v1/voices/{voice_id} ───
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`${VOICE_API}/v1/voices/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setVoices(prev => prev.filter(v => v.voice_id !== id))
      setToast({ type: 'success', msg: 'Voice profile deleted.' })
    } catch {
      setToast({ type: 'error', msg: 'Failed to delete voice.' })
    } finally {
      setDeletingId(null)
    }
  }

  // ─── API: POST /v1/tts (standard TTS with voice profile) ───
  const handleStandardTts = async () => {
    if (!ttsVoiceId || !ttsText.trim()) {
      setToast({ type: 'error', msg: 'Select a voice and enter text.' })
      return
    }
    setGenerating(true)
    setAudioResult(null)
    try {
      const res = await fetch(`${VOICE_API}/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: ttsVoiceId, text: ttsText.trim() }),
      })
      if (!res.ok) throw new Error('TTS generation failed')
      const blob = await res.blob()
      setAudioResult(URL.createObjectURL(blob))
      setToast({ type: 'success', msg: 'Speech generated!' })
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message || 'Failed to generate speech.' })
    } finally {
      setGenerating(false)
    }
  }

  // ─── API: POST /v1/clone-tts (one-shot clone) ───
  const handleCloneTts = async () => {
    if (!cloneAudioFile || !cloneRefText.trim() || !ttsText.trim()) {
      setToast({ type: 'error', msg: 'Upload audio, enter reference text, and text to speak.' })
      return
    }
    setGenerating(true)
    setAudioResult(null)
    try {
      const fd = new FormData()
      fd.append('ref_audio', cloneAudioFile)
      fd.append('ref_text', cloneRefText.trim())
      fd.append('text', ttsText.trim())
      const res = await fetch(`${VOICE_API}/v1/clone-tts`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Clone TTS failed')
      const blob = await res.blob()
      setAudioResult(URL.createObjectURL(blob))
      setToast({ type: 'success', msg: 'Voice cloned and speech generated!' })
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message || 'Clone TTS failed.' })
    } finally {
      setGenerating(false)
    }
  }

  // ─── API: POST /v1/tts/batch ───
  const handleBatchTts = async () => {
    const validItems = batchItems.filter(i => i.text.trim())
    if (!ttsVoiceId || validItems.length === 0) {
      setToast({ type: 'error', msg: 'Select a voice and enter at least one text item.' })
      return
    }
    setGenerating(true)
    setBatchResults([])
    try {
      const res = await fetch(`${VOICE_API}/v1/tts/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_id: ttsVoiceId,
          items: validItems.map(i => ({ id: i.id, text: i.text.trim() })),
        }),
      })
      if (!res.ok) throw new Error('Batch TTS failed')
      const data = await res.json()
      const results = Array.isArray(data) ? data : data.results || data.items || []
      setBatchResults(results)
      setToast({ type: 'success', msg: `Batch generated ${results.length} items!` })
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message || 'Batch TTS failed.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerate = () => {
    if (ttsMode === 'standard') handleStandardTts()
    else if (ttsMode === 'clone') handleCloneTts()
    else handleBatchTts()
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioResult) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => { if (step < 4) setStep((step + 1) as Step) }
  const handleBack = () => { if (step > 1) setStep((step - 1) as Step) }

  if (!isOpen) return null

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

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, marginBottom: 4, display: 'block',
  }

  // ─── Step 1: Overview ───
  const renderOverview = () => (
    <div style={{ padding: '20px 24px' }}>
      <style>{`
        @keyframes flowDown { 0%,100%{opacity:.3;transform:translateY(-3px)} 50%{opacity:1;transform:translateY(3px)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 8px rgba(167,139,250,0.2)} 50%{box-shadow:0 0 20px rgba(167,139,250,0.5)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Health status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
        padding: '8px 12px', borderRadius: 8,
        background: apiHealthy === null ? 'rgba(255,255,255,0.02)' : apiHealthy ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.04)',
        border: apiHealthy === null ? '1px solid rgba(255,255,255,0.06)' : apiHealthy ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(248,113,113,0.15)',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: apiHealthy === null ? '#6b7280' : apiHealthy ? '#34d399' : '#f87171',
          boxShadow: apiHealthy ? '0 0 6px #34d399' : 'none',
        }} />
        <span style={{ fontSize: 11, color: apiHealthy === null ? '#6b7280' : apiHealthy ? '#34d399' : '#f87171' }}>
          {apiHealthy === null ? 'Checking API...' : apiHealthy ? 'VoxCPM API Online' : 'API Unreachable'}
        </span>
        <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto', fontFamily: "'DM Mono', monospace" }}>avatar.zkagi.ai</span>
      </div>

      <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 20 }}>
        Clone any voice from a short audio sample, then use it for text-to-speech across your AI agents.
        Supports streaming, batch generation, and OpenAI-compatible endpoints.
      </p>

      {/* Flow diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {[
            { icon: FileAudio, label: 'Audio Sample', desc: 'Upload voice recording', color: '#a78bfa' },
            { icon: Mic, label: 'Reference Text', desc: 'Transcript of the audio', color: '#60a5fa' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
                <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <ArrowDown size={16} color="#7c6af7" style={{ animation: 'flowDown 2s ease infinite' }} />

        <div style={{
          width: '100%', padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(67,56,202,0.04))',
          border: '1px solid rgba(124,106,247,0.20)',
          borderRadius: 14, textAlign: 'center', animation: 'pulseGlow 3s ease infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Cpu size={16} color="#a78bfa" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd', fontFamily: "'Syne', sans-serif" }}>
              VoxCPM Voice Engine
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
            {['voice_clone', 'tts_stream', 'batch_gen', 'openai_compat'].map(tag => (
              <span key={tag} style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 99,
                background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.20)',
                color: '#a78bfa', fontFamily: "'DM Mono', monospace",
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <ArrowDown size={16} color="#7c6af7" style={{ animation: 'flowDown 2s ease infinite', animationDelay: '0.5s' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
          {[
            { icon: Volume2, label: 'TTS Audio', color: '#34d399' },
            { icon: Radio, label: 'Stream', color: '#f59e0b' },
            { icon: Headphones, label: 'Batch', color: '#60a5fa' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '12px 8px', textAlign: 'center',
            }}>
              <Icon size={16} color={color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All 12 API endpoints */}
      <div style={{
        marginTop: 20, padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          12 API Endpoints Available
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { method: 'GET', path: '/health', label: 'Health check', integrated: true },
            { method: 'GET', path: '/v1/voices', label: 'List voices', integrated: true },
            { method: 'GET', path: '/v1/voices/{id}', label: 'Get voice details', integrated: true },
            { method: 'DEL', path: '/v1/voices/{id}', label: 'Delete voice', integrated: true },
            { method: 'POST', path: '/voices/register', label: 'Register (file)', integrated: true },
            { method: 'POST', path: '/voices/register-url', label: 'Register (URL)', integrated: true },
            { method: 'POST', path: '/v1/clone-tts', label: 'One-shot clone', integrated: true },
            { method: 'POST', path: '/v1/tts', label: 'TTS with profile', integrated: true },
            { method: 'POST', path: '/v1/tts/stream', label: 'Stream TTS', integrated: false },
            { method: 'POST', path: '/v1/audio/speech', label: 'OpenAI compat', integrated: false },
            { method: 'POST', path: '/v1/tts/batch', label: 'Batch TTS', integrated: true },
            { method: 'POST', path: '/v1/tts/sse-stream', label: 'SSE stream', integrated: false },
          ].map(ep => (
            <div key={ep.path + ep.method} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {ep.integrated
                ? <Check size={10} color="#34d399" style={{ flexShrink: 0 }} />
                : <div style={{ width: 10, height: 10, borderRadius: 3, border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }} />}
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 3,
                background: ep.method === 'GET' ? 'rgba(52,211,153,0.10)' : ep.method === 'DEL' ? 'rgba(248,113,113,0.10)' : 'rgba(96,165,250,0.10)',
                color: ep.method === 'GET' ? '#34d399' : ep.method === 'DEL' ? '#f87171' : '#60a5fa',
                fontFamily: "'DM Mono', monospace", fontWeight: 600,
              }}>{ep.method}</span>
              <span style={{ fontSize: 10.5, color: ep.integrated ? '#9ca3af' : '#4b5563' }}>{ep.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── Step 2: Register Voice ───
  const renderRegister = () => (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
        Register a voice profile by providing a short audio sample and its transcript.
        The server stores it for TTS anytime.
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['file', 'url'] as const).map(mode => (
          <button key={mode} onClick={() => setRegisterMode(mode)} style={{
            flex: 1, padding: '8px 0', borderRadius: 8,
            background: registerMode === mode ? 'rgba(124,106,247,0.12)' : 'rgba(255,255,255,0.02)',
            border: registerMode === mode ? '1px solid rgba(124,106,247,0.30)' : '1px solid rgba(255,255,255,0.06)',
            color: registerMode === mode ? '#a78bfa' : '#6b7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            {mode === 'file' ? 'Upload File' : 'Audio URL'}
          </button>
        ))}
      </div>

      <div>
        <label style={labelStyle}>Voice ID</label>
        <input style={inputStyle} placeholder="e.g. my-agent-voice" value={voiceId}
          onChange={e => setVoiceId(e.target.value)} />
      </div>

      <div>
        <label style={labelStyle}>Display Name</label>
        <input style={inputStyle} placeholder="e.g. Agent Sarah" value={voiceName}
          onChange={e => setVoiceName(e.target.value)} />
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }}
        onChange={e => { setAudioFile(e.target.files?.[0] || null); }} />

      {registerMode === 'file' ? (
        <div>
          <label style={labelStyle}>Reference Audio</label>
          <div onClick={() => fileInputRef.current?.click()} style={{
            ...inputStyle, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '14px',
            border: audioFile ? '1px solid rgba(52,211,153,0.30)' : '1px solid rgba(255,255,255,0.08)',
            background: audioFile ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)',
          }}>
            {audioFile ? (
              <>
                <FileAudio size={16} color="#34d399" />
                <span style={{ fontSize: 12, color: '#34d399', flex: 1 }}>{audioFile.name}</span>
                <span style={{ fontSize: 10, color: '#6b7280' }}>{(audioFile.size / 1024 / 1024).toFixed(1)} MB</span>
              </>
            ) : (
              <><Upload size={16} color="#6b7280" /><span style={{ fontSize: 12, color: '#6b7280' }}>Click to upload audio (MP3, WAV, max 10MB)</span></>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label style={labelStyle}>Audio URL</label>
          <input style={inputStyle} placeholder="https://example.com/voice-sample.wav" value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)} />
        </div>
      )}

      <div>
        <label style={labelStyle}>Reference Text (transcript of the audio)</label>
        <textarea style={{ ...inputStyle, height: 70, resize: 'none' as const }} placeholder="Type the exact words spoken in the audio..."
          value={refText} onChange={e => setRefText(e.target.value)} />
      </div>

      <button onClick={handleRegister} disabled={registering} style={{
        width: '100%', padding: '12px 0', borderRadius: 10,
        background: registering ? 'rgba(124,106,247,0.3)' : 'linear-gradient(135deg, #7c6af7, #4338ca)',
        border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: registering ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: registering ? 'none' : '0 0 14px rgba(124,106,247,0.3)',
      }}>
        {registering ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Registering...</>
          : <><Upload size={14} /> Register Voice Profile</>}
      </button>
    </div>
  )

  // ─── Step 3: Voice Profiles ───
  const renderVoices = () => (
    <div style={{ padding: '20px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: '#6b7280' }}>
          {voices.length} voice profile{voices.length !== 1 ? 's' : ''} registered
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={fetchVoices} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 7, color: '#9ca3af', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <RefreshCw size={10} /> Refresh
          </button>
          <button onClick={() => setStep(2)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.20)',
            borderRadius: 7, color: '#a78bfa', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <Plus size={10} /> Add New
          </button>
        </div>
      </div>

      {loadingVoices ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} color="#a78bfa" />
          <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Loading voices...</span>
        </div>
      ) : voices.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
        }}>
          <Mic size={28} color="#374151" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>No voice profiles yet</p>
          <button onClick={() => setStep(2)} style={{
            padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #7c6af7, #4338ca)',
            border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            Register Your First Voice
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {voices.map(v => (
            <div key={v.voice_id} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: 'rgba(167,139,250,0.10)',
                border: '1px solid rgba(167,139,250,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Mic size={16} color="#a78bfa" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{v.name}</div>
                <div style={{
                  fontSize: 11, color: '#6b7280', fontFamily: "'DM Mono', monospace",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{v.voice_id}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { setTtsVoiceId(v.voice_id); setStep(4); }} style={{
                  padding: '6px 10px', borderRadius: 7,
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.20)',
                  color: '#34d399', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Volume2 size={10} /> Use
                </button>
                <button onClick={() => handleDelete(v.voice_id)} disabled={deletingId === v.voice_id} style={{
                  padding: '6px 8px', borderRadius: 7,
                  background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)',
                  color: '#f87171', cursor: deletingId === v.voice_id ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center',
                }}>
                  {deletingId === v.voice_id
                    ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Trash2 size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ─── Step 4: Generate Speech ───
  const renderSpeak = () => (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Hidden clone file input */}
      <input ref={cloneFileRef} type="file" accept="audio/*" style={{ display: 'none' }}
        onChange={e => { setCloneAudioFile(e.target.files?.[0] || null); }} />

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {([
          { mode: 'standard' as TtsMode, icon: Volume2, label: 'Profile TTS', color: '#34d399' },
          { mode: 'clone' as TtsMode, icon: Mic, label: 'Clone TTS', color: '#a78bfa' },
          { mode: 'batch' as TtsMode, icon: Layers, label: 'Batch', color: '#60a5fa' },
        ]).map(({ mode, icon: Icon, label, color }) => (
          <button key={mode} onClick={() => { setTtsMode(mode); setAudioResult(null); }} style={{
            flex: 1, padding: '8px 4px', borderRadius: 8,
            background: ttsMode === mode ? `${color}12` : 'rgba(255,255,255,0.02)',
            border: ttsMode === mode ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
            color: ttsMode === mode ? color : '#6b7280',
            fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>

      {/* Standard TTS: uses POST /v1/tts */}
      {ttsMode === 'standard' && (
        <>
          <div>
            <label style={labelStyle}>Voice Profile</label>
            <select value={ttsVoiceId} onChange={e => setTtsVoiceId(e.target.value)} style={{
              ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
            }}>
              <option value="" style={{ background: '#0d1122', color: '#6b7280' }}>Select a voice...</option>
              {voices.map(v => (
                <option key={v.voice_id} value={v.voice_id} style={{ background: '#0d1122', color: '#e2e8f0' }}>
                  {v.name} ({v.voice_id})
                </option>
              ))}
            </select>
            {voices.length === 0 && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertTriangle size={10} color="#f59e0b" />
                <span style={{ fontSize: 11, color: '#f59e0b' }}>
                  No voices registered.{' '}
                  <span onClick={() => setStep(2)} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Register one first</span>
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Text to Speak</label>
            <textarea style={{ ...inputStyle, height: 90, resize: 'none' as const }}
              placeholder="Enter the text you want to convert to speech..."
              value={ttsText} onChange={e => setTtsText(e.target.value)} />
          </div>
        </>
      )}

      {/* Clone TTS: uses POST /v1/clone-tts */}
      {ttsMode === 'clone' && (
        <>
          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
            One-shot voice cloning — upload a reference audio each time, no registration needed.
          </p>
          <div>
            <label style={labelStyle}>Reference Audio</label>
            <div onClick={() => cloneFileRef.current?.click()} style={{
              ...inputStyle, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px',
              border: cloneAudioFile ? '1px solid rgba(52,211,153,0.30)' : '1px solid rgba(255,255,255,0.08)',
              background: cloneAudioFile ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)',
            }}>
              {cloneAudioFile ? (
                <><FileAudio size={14} color="#34d399" /><span style={{ fontSize: 12, color: '#34d399', flex: 1 }}>{cloneAudioFile.name}</span></>
              ) : (
                <><Upload size={14} color="#6b7280" /><span style={{ fontSize: 12, color: '#6b7280' }}>Click to upload reference audio</span></>
              )}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Reference Text (what is said in the audio)</label>
            <input style={inputStyle} placeholder="Transcript of the reference audio..." value={cloneRefText}
              onChange={e => setCloneRefText(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Text to Speak</label>
            <textarea style={{ ...inputStyle, height: 90, resize: 'none' as const }}
              placeholder="Enter new text to speak in the cloned voice..."
              value={ttsText} onChange={e => setTtsText(e.target.value)} />
          </div>
        </>
      )}

      {/* Batch TTS: uses POST /v1/tts/batch */}
      {ttsMode === 'batch' && (
        <>
          <div>
            <label style={labelStyle}>Voice Profile</label>
            <select value={ttsVoiceId} onChange={e => setTtsVoiceId(e.target.value)} style={{
              ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
            }}>
              <option value="" style={{ background: '#0d1122', color: '#6b7280' }}>Select a voice...</option>
              {voices.map(v => (
                <option key={v.voice_id} value={v.voice_id} style={{ background: '#0d1122', color: '#e2e8f0' }}>
                  {v.name} ({v.voice_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Batch Items</label>
              <button onClick={() => setBatchItems(prev => [...prev, { id: String(prev.length + 1), text: '' }])} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6,
                background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.20)',
                color: '#a78bfa', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                <Plus size={9} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {batchItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#4b5563', fontFamily: "'DM Mono', monospace", width: 18, flexShrink: 0 }}>#{item.id}</span>
                  <input style={{ ...inputStyle, padding: '8px 10px', fontSize: 12 }}
                    placeholder={`Text for item ${item.id}...`} value={item.text}
                    onChange={e => setBatchItems(prev => prev.map((p, i) => i === idx ? { ...p, text: e.target.value } : p))} />
                  {batchItems.length > 1 && (
                    <button onClick={() => setBatchItems(prev => prev.filter((_, i) => i !== idx))} style={{
                      background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2, flexShrink: 0,
                    }}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {batchResults.length > 0 && (
            <div style={{
              background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: 10, padding: '12px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#34d399', marginBottom: 8 }}>
                Batch Results ({batchResults.length} items)
              </div>
              {batchResults.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: r.error ? '#f87171' : '#9ca3af', marginBottom: 4 }}>
                  #{r.id}: {r.error || 'Generated'}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={generating} style={{
        width: '100%', padding: '12px 0', borderRadius: 10,
        background: generating ? 'rgba(124,106,247,0.2)' : 'linear-gradient(135deg, #7c6af7, #4338ca)',
        border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: generating ? 'none' : '0 0 14px rgba(124,106,247,0.25)',
      }}>
        {generating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
          : ttsMode === 'batch' ? <><Layers size={14} /> Generate Batch</>
          : ttsMode === 'clone' ? <><Mic size={14} /> Clone &amp; Speak</>
          : <><Volume2 size={14} /> Generate Speech</>}
      </button>

      {/* Audio Result (for standard & clone modes) */}
      {audioResult && ttsMode !== 'batch' && (
        <div style={{
          background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: 12, padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Check size={14} color="#34d399" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>Audio ready</span>
          </div>
          <audio ref={audioRef} src={audioResult}
            onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={togglePlayback} style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: isPlaying ? 'rgba(248,113,113,0.10)' : 'rgba(52,211,153,0.10)',
              border: isPlaying ? '1px solid rgba(248,113,113,0.25)' : '1px solid rgba(52,211,153,0.25)',
              color: isPlaying ? '#f87171' : '#34d399', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif",
            }}>
              {isPlaying ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
            </button>
            <a href={audioResult} download="voice-output.wav" style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)',
              color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}>
              <Download size={12} /> Download
            </a>
          </div>
        </div>
      )}
    </div>
  )

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
        fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {toast && (
          <div style={{
            position: 'fixed', top: 16, right: 16, zIndex: 10000,
            padding: '10px 18px', borderRadius: 10,
            background: toast.type === 'success' ? '#34d399' : '#ef4444',
            color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c6af7, #4338ca)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,106,247,0.3)',
            }}>
              <Mic size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Syne', sans-serif" }}>
                Voice Agent
              </h2>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Clone &amp; synthesize voices for your agents</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = step === s.num
            const done = step > s.num
            return (
              <React.Fragment key={s.num}>
                {i > 0 && (
                  <div style={{ flex: 1, height: 1, background: done ? 'rgba(124,106,247,0.4)' : 'rgba(255,255,255,0.06)', margin: '0 6px' }} />
                )}
                <div onClick={() => setStep(s.num as Step)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                  background: active ? 'rgba(124,106,247,0.10)' : 'transparent',
                  border: active ? '1px solid rgba(124,106,247,0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: done ? '#7c6af7' : active ? 'rgba(124,106,247,0.20)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done ? <Check size={10} color="#fff" /> : <Icon size={10} color={active ? '#a78bfa' : '#4b5563'} />}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#a78bfa' : done ? '#9ca3af' : '#4b5563' }}>{s.label}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {step === 1 && renderOverview()}
        {step === 2 && renderRegister()}
        {step === 3 && renderVoices()}
        {step === 4 && renderSpeak()}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button onClick={handleBack} disabled={step === 1} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            background: step === 1 ? 'transparent' : 'rgba(255,255,255,0.03)',
            border: step === 1 ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
            color: step === 1 ? '#374151' : '#9ca3af', fontSize: 12, fontWeight: 500,
            cursor: step === 1 ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <ChevronLeft size={12} /> Back
          </button>
          {step < 4 && (
            <button onClick={handleNext} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg, #7c6af7, #4338ca)', border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 12px rgba(124,106,247,0.25)',
            }}>
              Next <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default VoiceAgentModal
