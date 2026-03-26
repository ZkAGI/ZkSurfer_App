'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import {
  Video, X, Play, Clock, Download, Eye, RefreshCw,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  Sparkles, Film, Monitor, Smartphone, Upload, Mic, Image as ImageIcon,
  FileVideo, Type, Palette, Volume2, Wand2, Bot, Zap, ArrowRight,
  Check, Settings2, Trash2, ExternalLink
} from 'lucide-react';
import bs58 from 'bs58';

// Proxy through Next.js API to avoid CORS issues
const API_BASE = '/api/video-agent';

type VideoStatus = 'QUEUED' | 'PROCESSING' | 'RENDERING' | 'COMPLETED' | 'FAILED';
type View = 'landing' | 'wizard' | 'create-video' | 'generating' | 'results' | 'history';
type WizardStep = 0 | 1 | 2 | 3 | 4;

interface VideoJob {
  id: string;
  topic: string;
  product?: string | null;
  mode: string;
  voice: string;
  format: string;
  customInstructions?: string | null;
  status: VideoStatus;
  phase?: string | null;
  phaseDetail?: string | null;
  queuePosition?: number | null;
  durationSeconds?: number | null;
  fileSizeMb?: number | null;
  paymentStatus: string;
  isPaid: boolean;
  failureReason?: string | null;
  previewUrl?: string | null;
  downloadUrl?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

interface AgentConfig {
  product: string;
  mode: 'standard' | 'story';
  voice: 'pad' | 'paw' | 'custom';
  format: '16:9' | '9:16';
  customInstructions: string;
  agentName: string;
  productId?: string;
  voiceFileName?: string;
  referenceImageName?: string;
  referenceVideoName?: string;
  createdAt: string;
  updatedAt: string;
}

// File size limits
const FILE_LIMITS = {
  voice: { maxMB: 10, label: 'Max 10 MB', accept: 'audio/mpeg,audio/wav,audio/mp3,audio/x-wav,audio/ogg' },
  image: { maxMB: 5, label: 'Max 5 MB', accept: 'image/png,image/jpeg,image/jpg,image/webp' },
  video: { maxMB: 50, label: 'Max 50 MB', accept: 'video/mp4,video/webm,video/quicktime' },
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploadState {
  voice: UploadStatus;
  image: UploadStatus;
  video: UploadStatus;
}

interface VideoAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_PREFIX = 'zk:videoAgent:';

const getAgentConfig = (wallet: string): AgentConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + wallet);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveAgentConfig = (wallet: string, config: AgentConfig) => {
  localStorage.setItem(STORAGE_PREFIX + wallet, JSON.stringify(config));
};

const deleteAgentConfig = (wallet: string) => {
  localStorage.removeItem(STORAGE_PREFIX + wallet);
};

export const VideoAgentModal: React.FC<VideoAgentModalProps> = ({ isOpen, onClose }) => {
  const { publicKey, signMessage } = useWallet();
  const walletAddr = publicKey?.toString() || '';

  // Auth
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Views
  const [view, setView] = useState<View>('landing');
  const [wizardStep, setWizardStep] = useState<WizardStep>(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  // Agent config (wizard)
  const [agentName, setAgentName] = useState('');
  const [product, setProduct] = useState('');
  const [mode, setMode] = useState<'standard' | 'story'>('standard');
  const [voice, setVoice] = useState<'pad' | 'paw' | 'custom'>('pad');
  const [format, setFormat] = useState<'16:9' | '9:16'>('16:9');
  const [customInstructions, setCustomInstructions] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);

  // Video creation
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results / history
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);
  const [history, setHistory] = useState<VideoJob[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Existing agent
  const [savedAgent, setSavedAgent] = useState<AgentConfig | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<FileUploadState>({ voice: 'idle', image: 'idle', video: 'idle' });
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // Payment state
  const [isPurchasing, setIsPurchasing] = useState(false);
  const paymentPollRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved agent on open
  useEffect(() => {
    if (isOpen && walletAddr) {
      const config = getAgentConfig(walletAddr);
      setSavedAgent(config);
      if (config) {
        // Pre-fill from saved config
        setAgentName(config.agentName);
        setProduct(config.product);
        setMode(config.mode);
        setVoice(config.voice);
        setFormat(config.format);
        setCustomInstructions(config.customInstructions);
      }
    }
  }, [isOpen, walletAddr]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      if (pollRef.current) clearInterval(pollRef.current);
      setView('landing');
      setWizardStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (paymentPollRef.current) clearInterval(paymentPollRef.current);
    };
  }, []);

  // ─── Auth ───
  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return null;
    }
    setIsAuthenticating(true);
    try {
      const timestamp = Date.now();
      const message = `Sign in to ZkAGI Video Engine\nTimestamp: ${timestamp}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);
      const res = await fetch(`${API_BASE}/auth/wallet-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString(), message, signature }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Authentication failed');
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error: any) {
      if (!error.message?.includes('User rejected')) {
        toast.error(`Auth failed: ${error.message}`);
      }
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]);

  const authHeaders = useCallback((token?: string) => ({
    'Content-Type': 'application/json',
    ...(token || accessToken ? { Authorization: `Bearer ${token || accessToken}` } : {}),
  }), [accessToken]);

  const ensureAuth = useCallback(async () => {
    if (accessToken) return accessToken;
    return authenticate();
  }, [accessToken, authenticate]);

  // ─── Wizard Navigation ───
  const goWizardNext = () => {
    // Validate custom voice has a file before proceeding from step 1
    if (wizardStep === 1 && voice === 'custom' && !voiceFile) {
      toast.error('Please upload a voice sample for custom voice');
      return;
    }
    if (wizardStep < 4) {
      setSlideDir('right');
      setWizardStep((wizardStep + 1) as WizardStep);
    }
  };

  const goWizardBack = () => {
    if (wizardStep > 0) {
      setSlideDir('left');
      setWizardStep((wizardStep - 1) as WizardStep);
    }
  };

  const validateFileSize = (file: File, type: keyof typeof FILE_LIMITS): boolean => {
    const limit = FILE_LIMITS[type];
    if (file.size > limit.maxMB * 1024 * 1024) {
      toast.error(`${file.name} exceeds ${limit.label}. Please choose a smaller file.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (file: File | null, type: 'voice' | 'image' | 'video', setter: (f: File | null) => void) => {
    if (file && !validateFileSize(file, type)) return;
    setter(file);
    setUploadStatus(prev => ({ ...prev, [type]: 'idle' }));
  };

  const uploadFileToProduct = async (pId: string, file: File, type: 'voice' | 'images' | 'videos', token: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/products/${pId}/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to upload ${type}`);
      }
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const saveAgent = async () => {
    if (!walletAddr) { toast.error('Connect wallet first'); return; }

    const hasFiles = voiceFile || referenceImage || referenceVideo;

    if (hasFiles) {
      setIsSavingAgent(true);
      const token = await ensureAuth();
      if (!token) { setIsSavingAgent(false); return; }

      try {
        // Create product if we don't have one yet
        let pId = productId || savedAgent?.productId;
        if (!pId) {
          const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({
              name: agentName || 'My Video Agent',
              description: product || 'Custom video agent product',
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create product');
          }
          const data = await res.json();
          pId = data.id;
          setProductId(pId!);
        }

        // Upload files
        if (voiceFile) {
          setUploadStatus(prev => ({ ...prev, voice: 'uploading' }));
          const ok = await uploadFileToProduct(pId!, voiceFile, 'voice', token);
          setUploadStatus(prev => ({ ...prev, voice: ok ? 'success' : 'error' }));
          if (!ok) { setIsSavingAgent(false); return; }
        }
        if (referenceImage) {
          setUploadStatus(prev => ({ ...prev, image: 'uploading' }));
          const ok = await uploadFileToProduct(pId!, referenceImage, 'images', token);
          setUploadStatus(prev => ({ ...prev, image: ok ? 'success' : 'error' }));
          if (!ok) { setIsSavingAgent(false); return; }
        }
        if (referenceVideo) {
          setUploadStatus(prev => ({ ...prev, video: 'uploading' }));
          const ok = await uploadFileToProduct(pId!, referenceVideo, 'videos', token);
          setUploadStatus(prev => ({ ...prev, video: ok ? 'success' : 'error' }));
          if (!ok) { setIsSavingAgent(false); return; }
        }

        // Save config locally
        const now = new Date().toISOString();
        const config: AgentConfig = {
          product, mode, voice, format, customInstructions,
          agentName: agentName || 'My Video Agent',
          productId: pId!,
          voiceFileName: voiceFile?.name,
          referenceImageName: referenceImage?.name,
          referenceVideoName: referenceVideo?.name,
          createdAt: savedAgent?.createdAt || now,
          updatedAt: now,
        };
        saveAgentConfig(walletAddr, config);
        setSavedAgent(config);
        toast.success('Agent saved with uploads!');
        setView('create-video');
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsSavingAgent(false);
      }
    } else {
      // No files — just save locally
      const now = new Date().toISOString();
      const config: AgentConfig = {
        product, mode, voice, format, customInstructions,
        agentName: agentName || 'My Video Agent',
        productId: productId || savedAgent?.productId,
        voiceFileName: voiceFile?.name,
        referenceImageName: referenceImage?.name,
        referenceVideoName: referenceVideo?.name,
        createdAt: savedAgent?.createdAt || now,
        updatedAt: now,
      };
      saveAgentConfig(walletAddr, config);
      setSavedAgent(config);
      toast.success('Agent saved!');
      setView('create-video');
    }
  };

  const handleDeleteAgent = () => {
    if (!walletAddr) return;
    deleteAgentConfig(walletAddr);
    setSavedAgent(null);
    setAgentName('');
    setProduct('');
    setMode('standard');
    setVoice('pad');
    setFormat('16:9');
    setCustomInstructions('');
    setVoiceFile(null);
    setReferenceImage(null);
    setReferenceVideo(null);
    setProductId(null);
    setUploadStatus({ voice: 'idle', image: 'idle', video: 'idle' });
    toast.success('Agent deleted');
    setView('landing');
  };

  // ─── Video Submission ───
  const submitVideo = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    const token = await ensureAuth();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const config = savedAgent || { product, mode, voice, format, customInstructions };
      const body: Record<string, unknown> = {
        topic: topic.trim(),
        mode: config.mode,
        voice: config.voice,
        format: config.format,
      };
      if (config.product) body.product = config.product;
      if (config.customInstructions?.trim()) body.customInstructions = config.customInstructions.trim();

      const res = await fetch(`${API_BASE}/videos`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit video');
      }

      const job: VideoJob = await res.json();
      setCurrentJob(job);
      setView('generating');
      toast.success('Video generation started!');
      startPolling(job.id, token);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Polling ───
  const startPolling = useCallback((videoId: string, token: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/videos/${videoId}`, { headers: authHeaders(token) });
        if (!res.ok) return;
        const job: VideoJob = await res.json();
        setCurrentJob(job);
        if (job.status === 'COMPLETED' || job.status === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (job.status === 'COMPLETED') {
            setView('results');
            toast.success('Video ready!');
          } else {
            toast.error(`Failed: ${job.failureReason || 'Unknown error'}`);
          }
        }
      } catch { /* ignore */ }
    };
    poll();
    pollRef.current = setInterval(poll, 5000);
  }, [authHeaders]);

  // ─── History ───
  const fetchHistory = useCallback(async () => {
    const token = await ensureAuth();
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/videos?limit=20`, { headers: authHeaders(token) });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setHistory(data.videos || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [ensureAuth, authHeaders]);

  // ─── Purchase Video ───
  const handlePurchaseVideo = useCallback(async (videoId: string) => {
    const token = await ensureAuth();
    if (!token) return;

    setIsPurchasing(true);
    try {
      const res = await fetch(`${API_BASE}/payments/checkout`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          videoId,
          successUrl: `${window.location.origin}${window.location.pathname}?video_paid=${videoId}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?video_cancelled=${videoId}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create checkout session');
      }

      const data = await res.json();
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        // Fallback: use Stripe.js redirect
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsPurchasing(false);
    }
  }, [ensureAuth, authHeaders]);

  // ─── Check for payment return (URL params) ───
  useEffect(() => {
    if (!isOpen || !walletAddr) return;
    const params = new URLSearchParams(window.location.search);
    const paidVideoId = params.get('video_paid');
    if (paidVideoId) {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('video_paid');
      window.history.replaceState({}, '', url.toString());

      // Poll for updated payment status
      const checkPaid = async () => {
        const token = await ensureAuth();
        if (!token) return;
        let attempts = 0;
        paymentPollRef.current = setInterval(async () => {
          attempts++;
          try {
            const res = await fetch(`${API_BASE}/videos/${paidVideoId}`, { headers: authHeaders(token) });
            if (!res.ok) return;
            const job: VideoJob = await res.json();
            if (job.isPaid) {
              if (paymentPollRef.current) clearInterval(paymentPollRef.current);
              setCurrentJob(job);
              setView('results');
              toast.success('Payment confirmed! Full video is ready to download.');
            } else if (attempts >= 12) {
              // Stop after ~1 minute
              if (paymentPollRef.current) clearInterval(paymentPollRef.current);
              setCurrentJob(job);
              setView('results');
              toast.info('Payment is being processed. Refresh in a moment to check.');
            }
          } catch { /* ignore */ }
        }, 5000);
      };
      checkPaid();
    }

    return () => {
      if (paymentPollRef.current) clearInterval(paymentPollRef.current);
    };
  }, [isOpen, walletAddr]);

  // ─── Status helpers ───
  const statusColor: Record<VideoStatus, string> = {
    QUEUED: '#f59e0b', PROCESSING: '#60a5fa', RENDERING: '#a78bfa', COMPLETED: '#34d399', FAILED: '#ef4444',
  };
  const statusLabel: Record<VideoStatus, string> = {
    QUEUED: 'In Queue', PROCESSING: 'Processing', RENDERING: 'Rendering', COMPLETED: 'Complete', FAILED: 'Failed',
  };

  if (!isOpen) return null;

  // ─── Reusable pieces ───
  const OptionCard = ({ selected, onClick, icon: Icon, title, desc, color }: {
    selected: boolean; onClick: () => void; icon: any; title: string; desc: string; color: string;
  }) => (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
          : 'rgba(255,255,255,0.02)',
        border: selected ? `1.5px solid ${color}40` : '1.5px solid rgba(255,255,255,0.06)',
        boxShadow: selected ? `0 8px 32px ${color}15` : 'none',
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{ background: selected ? `${color}20` : 'rgba(255,255,255,0.04)' }}
        >
          <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: selected ? color : '#6b7280' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-semibold transition-colors ${selected ? 'text-white' : 'text-[#9ca3af]'}`}>{title}</span>
            {selected && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <span className="text-[11px] text-[#6b7280] leading-relaxed mt-0.5 block">{desc}</span>
        </div>
      </div>
    </button>
  );

  const FileDropZone = ({ label, icon: Icon, file, accept, inputRef: ref, onFileChange, color, sizeLimit, status }: {
    label: string; icon: any; file: File | null; accept: string;
    inputRef: React.RefObject<HTMLInputElement | null>; onFileChange: (f: File | null) => void; color: string;
    sizeLimit: string; status: UploadStatus;
  }) => (
    <div
      onClick={() => status !== 'uploading' ? ref.current?.click() : undefined}
      className={`group rounded-xl p-4 flex items-center gap-3 transition-all duration-200 ${status === 'uploading' ? 'cursor-wait opacity-80' : 'cursor-pointer hover:scale-[1.01]'}`}
      style={{
        background: status === 'success' ? `${color}10` : file ? `${color}08` : 'rgba(255,255,255,0.02)',
        border: status === 'error' ? '1px solid rgba(239,68,68,0.3)' : status === 'success' ? `1px solid ${color}40` : file ? `1px solid ${color}30` : '1px dashed rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: file ? `${color}15` : 'rgba(255,255,255,0.04)' }}
      >
        {status === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" style={{ color }} /> :
         status === 'success' ? <CheckCircle2 className="w-4 h-4" style={{ color }} /> :
         status === 'error' ? <AlertCircle className="w-4 h-4 text-[#ef4444]" /> :
         file ? <Check className="w-4 h-4" style={{ color }} /> :
         <Icon className="w-4 h-4 text-[#6b7280]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[12px] font-medium ${file ? 'text-white' : 'text-[#9ca3af]'}`}>
          {status === 'uploading' ? 'Uploading...' : file ? file.name : label}
        </div>
        <div className="text-[10px] text-[#4b5563] mt-0.5 flex items-center gap-2">
          {file ? (
            <>
              <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              {status === 'success' && <span className="text-[#34d399]">Uploaded</span>}
              {status === 'error' && <span className="text-[#ef4444]">Failed — tap to retry</span>}
            </>
          ) : (
            <span>Click to upload · {sizeLimit}</span>
          )}
        </div>
      </div>
      {file && status !== 'uploading' && (
        <button
          onClick={e => { e.stopPropagation(); onFileChange(null); }}
          className="w-7 h-7 rounded-lg bg-[rgba(239,68,68,0.1)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] transition-colors"
        >
          <X className="w-3 h-3 text-[#ef4444]" />
        </button>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => {
        const f = e.target.files?.[0] || null;
        onFileChange(f);
        e.target.value = '';
      }} />
    </div>
  );

  const WizardProgress = () => (
    <div className="flex items-center gap-1.5 px-6 pb-4">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className={`w-full h-1 rounded-full transition-all duration-500 ${i === wizardStep ? 'animate-pulse' : ''}`}
            style={{
              background: i < wizardStep ? '#34d399' : i === wizardStep ? '#a78bfa' : 'rgba(255,255,255,0.06)',
            }}
          />
          <span className={`text-[8px] uppercase tracking-wider ${
            i <= wizardStep ? 'text-[#9ca3af]' : 'text-[#4b5563]'
          }`}>
            {['Product', 'Style', 'Media', 'Tone', 'Review'][i]}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-dmSans">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'overlayFadeIn 0.3s ease-out forwards' }}
        onClick={onClose}
      />

      <div
        className="relative z-10 w-[95vw] max-w-[540px] max-h-[88vh] rounded-2xl border border-[rgba(124,106,247,0.15)] overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(168deg, #0d1120 0%, #070a14 50%, #0b0e1a 100%)',
          boxShadow: '0 0 80px rgba(124,106,247,0.08), 0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          animation: 'walletModalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#a78bfa] to-transparent opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'landing' && (
              <button
                onClick={() => {
                  if (view === 'wizard') { if (wizardStep > 0) goWizardBack(); else setView('landing'); }
                  else if (view === 'create-video' || view === 'history') setView('landing');
                  else if (view === 'results') setView('create-video');
                  else setView('landing');
                }}
                className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-colors mr-1"
              >
                <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-[rgba(167,139,250,0.12)] flex items-center justify-center">
              <Video className="w-[18px] h-[18px] text-[#a78bfa]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Video Agent</h2>
              <p className="text-[11px] text-[#6b7280] mt-0.5">
                {view === 'wizard' ? `Step ${wizardStep + 1} of 5` :
                 view === 'generating' ? 'Generating...' :
                 view === 'results' ? 'Output Ready' :
                 view === 'history' ? 'Your Videos' :
                 'AI-powered video creation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'landing' && (
              <button
                onClick={() => { setView('history'); fetchHistory(); }}
                className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-colors"
                title="History"
              >
                <Clock className="w-4 h-4 text-[#6b7280]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#6b7280]" />
            </button>
          </div>
        </div>

        {view === 'wizard' && <WizardProgress />}

        {/* ═══ CONTENT ═══ */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 wallet-modal-scroll">

          {/* ══ LANDING ══ */}
          {view === 'landing' && (
            <div className="space-y-4" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>

              {/* Agent exists - show summary + quick create */}
              {savedAgent ? (
                <>
                  {/* Agent card */}
                  <div
                    className="rounded-2xl p-5 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(52,211,153,0.04) 100%)',
                      border: '1px solid rgba(167,139,250,0.15)',
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.15)] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#a78bfa]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-white">{savedAgent.agentName}</div>
                        <div className="text-[10px] text-[#6b7280]">Last updated {new Date(savedAgent.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {savedAgent.product && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.1)] text-[#34d399] border border-[rgba(52,211,153,0.2)]">
                          {savedAgent.product}
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(167,139,250,0.1)] text-[#a78bfa] border border-[rgba(167,139,250,0.2)]">
                        {savedAgent.mode === 'standard' ? 'Explainer' : 'Story'}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(96,165,250,0.1)] text-[#60a5fa] border border-[rgba(96,165,250,0.2)]">
                        Voice: {savedAgent.voice === 'custom' ? 'Custom' : savedAgent.voice}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
                        {savedAgent.format}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setView('wizard')}
                        className="text-[11px] text-[#6b7280] hover:text-[#9ca3af] flex items-center gap-1 transition-colors"
                      >
                        <Settings2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={handleDeleteAgent}
                        className="text-[11px] text-[#ef4444]/60 hover:text-[#ef4444] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Quick video creation */}
                  <div style={{ animation: 'walletItemIn 0.3s ease-out 0.15s both' }}>
                    <label className="text-[12px] font-medium text-[#9ca3af] mb-2 block">What&apos;s the video about?</label>
                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. How Solana achieves 65,000 TPS..."
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#4b5563] outline-none resize-none transition-colors focus:border-[rgba(167,139,250,0.4)]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="text-[10px] text-[#4b5563] text-right mt-1">{topic.length}/500</div>
                  </div>

                  <button
                    onClick={submitVideo}
                    disabled={isSubmitting || !topic.trim() || isAuthenticating}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-4 text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #7c6af7 0%, #6c5ce7 100%)',
                      boxShadow: '0 4px 20px rgba(124,106,247,0.3)',
                      animation: 'walletItemIn 0.3s ease-out 0.25s both',
                    }}
                  >
                    {isAuthenticating ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>
                     : isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                     : <><Zap className="w-4 h-4" /> Generate Video</>}
                  </button>
                </>
              ) : (
                /* ── No agent yet ── */
                <>
                  <div className="text-center pt-2 pb-4" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.12)] flex items-center justify-center">
                      <Wand2 className="w-7 h-7 text-[#a78bfa]" />
                    </div>
                    <h3 className="text-[16px] font-bold text-white mb-1">Create Your Video Agent</h3>
                    <p className="text-[12px] text-[#6b7280] max-w-[320px] mx-auto leading-relaxed">
                      Set up once, create unlimited videos. Your agent remembers your style, voice & preferences.
                    </p>
                  </div>

                  {/* Two choices */}
                  <div className="space-y-3">
                    <button
                      onClick={() => { setView('wizard'); setWizardStep(0); }}
                      className="group w-full rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(167,139,250,0.02) 100%)',
                        border: '1.5px solid rgba(167,139,250,0.15)',
                        animation: 'walletItemIn 0.3s ease-out 0.1s both',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(167,139,250,0.12)] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Bot className="w-6 h-6 text-[#a78bfa]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[14px] font-semibold text-white mb-0.5">Setup Agent</div>
                          <div className="text-[11px] text-[#6b7280] leading-relaxed">
                            Configure product, voice, style & upload references
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#4b5563] group-hover:text-[#a78bfa] group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>

                    <button
                      onClick={() => setView('create-video')}
                      className="group w-full rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1.5px solid rgba(255,255,255,0.06)',
                        animation: 'walletItemIn 0.3s ease-out 0.2s both',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(52,211,153,0.08)] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-6 h-6 text-[#34d399]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[14px] font-semibold text-white mb-0.5">Quick Video</div>
                          <div className="text-[11px] text-[#6b7280] leading-relaxed">
                            Skip setup, generate a one-off video with defaults
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#4b5563] group-hover:text-[#34d399] group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ WIZARD ══ */}
          {view === 'wizard' && (
            <div key={wizardStep} style={{ animation: `walletSectionIn 0.35s ease-out both` }}>
              {/* Step 0: Product */}
              {wizardStep === 0 && (
                <div className="space-y-3">
                  <div className="mb-1">
                    <h3 className="text-[15px] font-bold text-white">Which product is this for?</h3>
                    <p className="text-[11px] text-[#6b7280] mt-1">Select a product or choose custom for your own brand.</p>
                  </div>
                  {[
                    { id: 'pawpad', icon: Sparkles, title: 'PawPad', desc: 'Safest Solana wallet for the masses', color: '#f59e0b' },
                    { id: 'zynapse', icon: Zap, title: 'Zynapse', desc: 'AI inference layer with API-first architecture', color: '#60a5fa' },
                    { id: 'zkterminal', icon: Bot, title: 'ZkTerminal', desc: 'Privacy-first AI terminal with ZK proofs', color: '#a78bfa' },
                    { id: '', icon: Palette, title: 'Custom / None', desc: 'No product focus — general video content', color: '#34d399' },
                  ].map(p => (
                    <OptionCard key={p.id} selected={product === p.id} onClick={() => setProduct(p.id)} icon={p.icon} title={p.title} desc={p.desc} color={p.color} />
                  ))}
                </div>
              )}

              {/* Step 1: Style & Voice */}
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">Choose your style</h3>
                    <p className="text-[11px] text-[#6b7280] mb-3">How should the video feel?</p>
                    <div className="space-y-2.5">
                      <OptionCard selected={mode === 'standard'} onClick={() => setMode('standard')} icon={Film} title="Explainer" desc="Clear, structured breakdown — great for tutorials & product demos" color="#60a5fa" />
                      <OptionCard selected={mode === 'story'} onClick={() => setMode('story')} icon={Sparkles} title="Story" desc="Narrative-driven, emotional arc — perfect for brand stories" color="#f59e0b" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-semibold text-white mb-1">Narrator voice</h3>
                    <p className="text-[11px] text-[#6b7280] mb-3">Pick a character voice or upload your own</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'pad' as const, title: 'Pad', desc: 'Calm explainer', icon: Volume2, color: '#a78bfa' },
                        { id: 'paw' as const, title: 'Paw', desc: 'Energetic host', icon: Mic, color: '#34d399' },
                      ].map(v => (
                        <OptionCard key={v.id} selected={voice === v.id} onClick={() => setVoice(v.id)} icon={v.icon} title={v.title} desc={v.desc} color={v.color} />
                      ))}
                    </div>
                    <div className="mt-2.5">
                      <OptionCard
                        selected={voice === 'custom'}
                        onClick={() => setVoice('custom')}
                        icon={Upload}
                        title="Custom Voice"
                        desc="Upload your own voice sample (MP3, WAV)"
                        color="#f472b6"
                      />
                    </div>
                    {voice === 'custom' && (
                      <div className="mt-3" style={{ animation: 'walletSectionIn 0.25s ease-out both' }}>
                        <FileDropZone
                          label="Upload voice sample (MP3, WAV)"
                          icon={Mic}
                          file={voiceFile}
                          accept={FILE_LIMITS.voice.accept}
                          inputRef={voiceInputRef}
                          onFileChange={(f) => handleFileChange(f, 'voice', setVoiceFile)}
                          color="#f472b6"
                          sizeLimit={FILE_LIMITS.voice.label}
                          status={uploadStatus.voice}
                        />
                        {!voiceFile && (
                          <p className="text-[10px] text-[#f59e0b] mt-1.5 ml-1">A voice sample is required for custom voice</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[14px] font-semibold text-white mb-1">Aspect ratio</h3>
                    <div className="grid grid-cols-2 gap-2.5 mt-2">
                      <OptionCard selected={format === '16:9'} onClick={() => setFormat('16:9')} icon={Monitor} title="Landscape" desc="16:9 — YouTube, web" color="#60a5fa" />
                      <OptionCard selected={format === '9:16'} onClick={() => setFormat('9:16')} icon={Smartphone} title="Portrait" desc="9:16 — Reels, TikTok" color="#f472b6" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Media uploads */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">Upload references</h3>
                    <p className="text-[11px] text-[#6b7280] mb-4">Optional — help the AI match your brand. Skip if none.</p>
                  </div>

                  {voice !== 'custom' && (
                    <FileDropZone
                      label="Voice sample (MP3, WAV)"
                      icon={Mic}
                      file={voiceFile}
                      accept={FILE_LIMITS.voice.accept}
                      inputRef={voiceInputRef}
                      onFileChange={(f) => handleFileChange(f, 'voice', setVoiceFile)}
                      color="#a78bfa"
                      sizeLimit={FILE_LIMITS.voice.label}
                      status={uploadStatus.voice}
                    />
                  )}
                  {voice === 'custom' && voiceFile && (
                    <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#f472b608', border: '1px solid #f472b630' }}>
                      <div className="w-8 h-8 rounded-lg bg-[rgba(244,114,182,0.15)] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#f472b6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-white truncate">{voiceFile.name}</div>
                        <div className="text-[10px] text-[#6b7280]">Custom voice · {(voiceFile.size / 1024 / 1024).toFixed(1)} MB</div>
                      </div>
                    </div>
                  )}
                  <FileDropZone
                    label="Reference image (PNG, JPG, WebP)"
                    icon={ImageIcon}
                    file={referenceImage}
                    accept={FILE_LIMITS.image.accept}
                    inputRef={imageInputRef}
                    onFileChange={(f) => handleFileChange(f, 'image', setReferenceImage)}
                    color="#60a5fa"
                    sizeLimit={FILE_LIMITS.image.label}
                    status={uploadStatus.image}
                  />
                  <FileDropZone
                    label="Reference video (MP4, WebM)"
                    icon={FileVideo}
                    file={referenceVideo}
                    accept={FILE_LIMITS.video.accept}
                    inputRef={videoInputRef}
                    onFileChange={(f) => handleFileChange(f, 'video', setReferenceVideo)}
                    color="#34d399"
                    sizeLimit={FILE_LIMITS.video.label}
                    status={uploadStatus.video}
                  />

                  <p className="text-[10px] text-[#4b5563] text-center mt-2">Files will be uploaded when you save the agent</p>
                </div>
              )}

              {/* Step 3: Tone & instructions */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">Set the tone</h3>
                    <p className="text-[11px] text-[#6b7280] mb-3">Tell the AI how you want your videos to feel.</p>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#9ca3af] mb-1.5 block">Agent name</label>
                    <input
                      value={agentName}
                      onChange={e => setAgentName(e.target.value)}
                      placeholder="My Video Agent"
                      maxLength={50}
                      className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#4b5563] outline-none transition-colors focus:border-[rgba(167,139,250,0.4)]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#9ca3af] mb-1.5 block">Custom instructions</label>
                    <textarea
                      value={customInstructions}
                      onChange={e => setCustomInstructions(e.target.value)}
                      placeholder={"e.g.\n• Keep it under 60 seconds\n• Use bold, punchy language\n• Always mention the community\n• End with a strong CTA"}
                      maxLength={2000}
                      rows={5}
                      className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#4b5563] outline-none resize-none transition-colors focus:border-[rgba(167,139,250,0.4)]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="text-[10px] text-[#4b5563] text-right mt-1">{customInstructions.length}/2000</div>
                  </div>

                  {/* Quick templates */}
                  <div>
                    <span className="text-[11px] text-[#6b7280] mb-2 block">Quick templates</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Professional & clean',
                        'Hype & energetic',
                        'Educational & calm',
                        'Meme-style & fun',
                        'Under 60 seconds',
                        'Include CTA at end',
                      ].map(t => (
                        <button
                          key={t}
                          onClick={() => setCustomInstructions(prev => prev ? `${prev}\n• ${t}` : `• ${t}`)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-[#9ca3af] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(167,139,250,0.2)] hover:text-[#a78bfa] transition-all"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">Review your agent</h3>
                    <p className="text-[11px] text-[#6b7280] mb-4">Everything look good? Save and start creating.</p>
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                      { label: 'Name', value: agentName || 'My Video Agent' },
                      { label: 'Product', value: product || 'None (custom)' },
                      { label: 'Style', value: mode === 'standard' ? 'Explainer' : 'Story' },
                      { label: 'Voice', value: voice === 'pad' ? 'Pad (explainer)' : voice === 'paw' ? 'Paw (host)' : `Custom (${voiceFile?.name || 'none'})` },
                      { label: 'Format', value: format },
                      { label: 'Voice file', value: voiceFile?.name || 'None' },
                      { label: 'Ref image', value: referenceImage?.name || 'None' },
                      { label: 'Ref video', value: referenceVideo?.name || 'None' },
                    ].map((item, i) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <span className="text-[11px] text-[#6b7280]">{item.label}</span>
                        <span className="text-[12px] text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                    {customInstructions && (
                      <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="text-[11px] text-[#6b7280] block mb-1">Instructions</span>
                        <span className="text-[11px] text-[#9ca3af] whitespace-pre-wrap leading-relaxed">{customInstructions}</span>
                      </div>
                    )}
                  </div>

                  {(voiceFile || referenceImage || referenceVideo) && (
                    <div className="rounded-xl p-3 bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.12)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Upload className="w-3 h-3 text-[#a78bfa]" />
                        <span className="text-[11px] font-medium text-[#a78bfa]">Files to upload</span>
                      </div>
                      <div className="text-[10px] text-[#6b7280] space-y-0.5">
                        {voiceFile && <div>Voice: {voiceFile.name} ({(voiceFile.size / 1024 / 1024).toFixed(1)} MB)</div>}
                        {referenceImage && <div>Image: {referenceImage.name} ({(referenceImage.size / 1024 / 1024).toFixed(1)} MB)</div>}
                        {referenceVideo && <div>Video: {referenceVideo.name} ({(referenceVideo.size / 1024 / 1024).toFixed(1)} MB)</div>}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={saveAgent}
                    disabled={isSavingAgent || (voice === 'custom' && !voiceFile)}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-4 text-[14px] font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                      boxShadow: '0 4px 20px rgba(52,211,153,0.3)',
                    }}
                  >
                    {isSavingAgent ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading & Saving...</>
                     : <><CheckCircle2 className="w-5 h-5" /> Save Agent & Create Videos</>}
                  </button>
                </div>
              )}

              {/* Wizard nav buttons (except review which has save) */}
              {wizardStep < 4 && (
                <div className="flex gap-3 mt-6">
                  {wizardStep > 0 && (
                    <button
                      onClick={goWizardBack}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium text-[#9ca3af] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <button
                    onClick={goWizardNext}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.01]"
                    style={{
                      background: 'linear-gradient(135deg, #7c6af7 0%, #6c5ce7 100%)',
                      boxShadow: '0 4px 16px rgba(124,106,247,0.25)',
                    }}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ QUICK VIDEO (no agent) ══ */}
          {view === 'create-video' && !savedAgent && (
            <div className="space-y-4" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>
              <div>
                <h3 className="text-[15px] font-bold text-white mb-1">Quick Video</h3>
                <p className="text-[11px] text-[#6b7280] mb-4">Using default settings. Set up an agent for custom config.</p>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#9ca3af] mb-1.5 block">Topic *</label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. How Solana achieves 65,000 TPS"
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#4b5563] outline-none resize-none transition-colors focus:border-[rgba(167,139,250,0.4)]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <div className="text-[10px] text-[#4b5563] text-right mt-1">{topic.length}/500</div>
              </div>

              <button
                onClick={submitVideo}
                disabled={isSubmitting || !topic.trim() || isAuthenticating}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-4 text-[14px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #7c6af7 0%, #6c5ce7 100%)',
                  boxShadow: '0 4px 20px rgba(124,106,247,0.3)',
                }}
              >
                {isAuthenticating ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>
                 : isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                 : <><Zap className="w-4 h-4" /> Generate Video</>}
              </button>

              {!publicKey && (
                <p className="text-[11px] text-[#f59e0b] text-center">Connect your wallet to generate videos</p>
              )}
            </div>
          )}

          {/* ══ GENERATING ══ */}
          {view === 'generating' && currentJob && (
            <div className="space-y-5" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>
              <div
                className="rounded-2xl p-5 border relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: `${statusColor[currentJob.status]}25`,
                }}
              >
                {/* Animated glow */}
                <div className="absolute inset-0 opacity-20" style={{
                  background: `radial-gradient(circle at 50% 0%, ${statusColor[currentJob.status]}30 0%, transparent 60%)`,
                  animation: 'breathe 3s ease-in-out infinite',
                }} />

                <div className="flex items-center gap-3 mb-5 relative">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${statusColor[currentJob.status]}15` }}
                    >
                      {currentJob.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-6 h-6" style={{ color: statusColor[currentJob.status] }} />
                      ) : currentJob.status === 'FAILED' ? (
                        <AlertCircle className="w-6 h-6" style={{ color: statusColor[currentJob.status] }} />
                      ) : (
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: statusColor[currentJob.status] }} />
                      )}
                    </div>
                    {currentJob.status !== 'COMPLETED' && currentJob.status !== 'FAILED' && (
                      <div className="absolute -inset-1 rounded-xl animate-ping opacity-20" style={{ border: `2px solid ${statusColor[currentJob.status]}` }} />
                    )}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-white">{statusLabel[currentJob.status]}</div>
                    {currentJob.phase && (
                      <p className="text-[12px] text-[#6b7280] mt-0.5">{currentJob.phaseDetail || currentJob.phase}</p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1.5 mb-4 relative">
                  {['QUEUED', 'PROCESSING', 'RENDERING', 'COMPLETED'].map((s, i) => {
                    const stages: VideoStatus[] = ['QUEUED', 'PROCESSING', 'RENDERING', 'COMPLETED'];
                    const currentIdx = stages.indexOf(currentJob.status);
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={s} className="flex-1">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${active ? 'animate-pulse' : ''}`}
                          style={{
                            background: done ? '#34d399' : active ? statusColor[currentJob.status] : 'rgba(255,255,255,0.06)',
                            boxShadow: (done || active) ? `0 0 8px ${done ? '#34d39940' : statusColor[currentJob.status] + '40'}` : 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {currentJob.queuePosition && currentJob.status === 'QUEUED' && (
                  <div className="text-[12px] text-[#f59e0b] flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5" /> Queue position: #{currentJob.queuePosition}
                  </div>
                )}

                <div className="relative rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] text-[#6b7280]">Topic</span>
                  <div className="text-[12px] text-[#d1d5db] mt-0.5">{currentJob.topic}</div>
                </div>
              </div>

              {currentJob.status === 'FAILED' && (
                <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)]">
                  <p className="text-[12px] text-[#ef4444] mb-3">{currentJob.failureReason || 'Unknown error'}</p>
                  <button onClick={() => { setView(savedAgent ? 'landing' : 'create-video'); setCurrentJob(null); }} className="text-[12px] text-[#a78bfa] hover:underline">
                    Try again
                  </button>
                </div>
              )}

              {currentJob.status === 'COMPLETED' && (
                <button
                  onClick={() => setView('results')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 4px 16px rgba(52,211,153,0.3)' }}
                >
                  <Play className="w-5 h-5" /> View Result
                </button>
              )}
            </div>
          )}

          {/* ══ RESULTS ══ */}
          {view === 'results' && currentJob?.status === 'COMPLETED' && (
            <div className="space-y-4" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>
              {currentJob.previewUrl && (
                <div className="rounded-2xl overflow-hidden border border-[rgba(167,139,250,0.15)]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <video src={currentJob.previewUrl} controls autoPlay muted playsInline className="w-full" style={{ maxHeight: '280px' }} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Duration', value: currentJob.durationSeconds ? `${currentJob.durationSeconds}s` : '--', color: '#a78bfa' },
                  { label: 'Size', value: currentJob.fileSizeMb ? `${currentJob.fileSizeMb.toFixed(1)} MB` : '--', color: '#60a5fa' },
                  { label: 'Format', value: currentJob.format, color: '#34d399' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-[10px] text-[#6b7280] mb-1">{item.label}</div>
                    <div className="text-[14px] font-semibold" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {currentJob.downloadUrl && currentJob.isPaid ? (
                <a
                  href={currentJob.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 4px 16px rgba(52,211,153,0.3)' }}
                >
                  <Download className="w-4 h-4" /> Download Full Video
                </a>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-[#f59e0b]" />
                      <span className="text-[13px] font-medium text-[#f59e0b]">Preview Only</span>
                    </div>
                    <p className="text-[11px] text-[#9ca3af]">5-second watermarked preview. Purchase the full video to download.</p>
                  </div>
                  <button
                    onClick={() => handlePurchaseVideo(currentJob.id)}
                    disabled={isPurchasing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)', boxShadow: '0 4px 16px rgba(124,106,247,0.3)' }}
                  >
                    {isPurchasing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Buy Full Video — $5.00</>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => { setView(savedAgent ? 'landing' : 'create-video'); setTopic(''); setCurrentJob(null); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium text-[#a78bfa] bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] hover:bg-[rgba(167,139,250,0.12)] transition-all"
              >
                <Sparkles className="w-4 h-4" /> Create Another
              </button>
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {view === 'history' && (
            <div className="space-y-3" style={{ animation: 'walletSectionIn 0.4s ease-out both' }}>
              {isLoadingHistory ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-6 h-6 text-[#a78bfa] animate-spin mb-3" />
                  <span className="text-[12px] text-[#6b7280]">Loading videos...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Film className="w-10 h-10 text-[#4b5563] mb-3" />
                  <span className="text-[13px] text-[#6b7280]">No videos yet</span>
                  <button onClick={() => setView('landing')} className="mt-3 text-[12px] text-[#a78bfa] hover:underline">
                    Create your first
                  </button>
                </div>
              ) : (
                history.map((job, idx) => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setCurrentJob(job);
                      if (job.status === 'COMPLETED') setView('results');
                      else {
                        setView('generating');
                        if (job.status !== 'FAILED' && accessToken) startPolling(job.id, accessToken);
                      }
                    }}
                    className="w-full flex items-center gap-3 rounded-xl p-3.5 transition-all hover:scale-[1.005] text-left"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      animation: `walletItemIn 0.3s ease-out ${idx * 0.04}s both`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor[job.status]}12` }}>
                      {job.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" style={{ color: statusColor[job.status] }} /> :
                       job.status === 'FAILED' ? <AlertCircle className="w-4 h-4" style={{ color: statusColor[job.status] }} /> :
                       <Loader2 className="w-4 h-4 animate-spin" style={{ color: statusColor[job.status] }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white truncate">{job.topic}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: statusColor[job.status], background: `${statusColor[job.status]}12` }}>
                          {statusLabel[job.status]}
                        </span>
                        <span className="text-[10px] text-[#4b5563]">{new Date(job.createdAt).toLocaleDateString()}</span>
                        {job.status === 'COMPLETED' && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${job.isPaid ? 'text-[#34d399] bg-[rgba(52,211,153,0.1)]' : 'text-[#f59e0b] bg-[rgba(245,158,11,0.1)]'}`}>
                            {job.isPaid ? 'Paid' : '$5'}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#4b5563] flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-[#4b5563]">Powered by ZkAGI Video Engine</span>
          {publicKey && (
            <span className="text-[10px] text-[#4b5563]">
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAgentModal;
