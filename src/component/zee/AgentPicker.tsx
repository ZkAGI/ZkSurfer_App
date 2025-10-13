'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentCart, CubItem } from '@/stores/agent-cart-store';

// ---------- Starfield backdrop (same flavor as FlowGate, lighter blur) ----------
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<{x:number;y:number;z:number;r:number;vx:number;vy:number;color:string}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let w = 0, h = 0;

    const palette = ['#c084fc','#a78bfa','#f0abfc','#818cf8','#e879f9'];

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.floor((w * h) / 1200);
      const stars = starsRef.current; stars.length = 0;
      for (let i = 0; i < target; i++) {
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          z: 0.5 + Math.random()*1.5,
          r: 0.4 + Math.random()*1.2,
          vx: (Math.random()*0.08 + 0.02) * (Math.random()<0.5?-1:1),
          vy: Math.random()*0.12 + 0.02,
          color: palette[(Math.random()*palette.length)|0],
        });
      }
    };

    const draw = () => {
      const g = ctx.createRadialGradient(w*0.5,h*0.5,0,w*0.5,h*0.5,Math.max(w,h)*0.75);
      g.addColorStop(0,'rgba(88,28,135,0.35)');
      g.addColorStop(0.45,'rgba(30,27,75,0.45)');
      g.addColorStop(1,'rgba(2,6,23,0.7)');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      const stars = starsRef.current;
      for (let i=0;i<stars.length;i++){
        const s = stars[i];
        s.x += s.vx*s.z; s.y += s.vy*s.z;
        if (s.x<-5) s.x=w+5; if (s.x>w+5) s.x=-5;
        if (s.y>h+5){ s.y=-5; s.x=Math.random()*w; }

        const t = (Math.sin((Date.now()*0.002 + i) * s.z) + 1)*0.5;
        const r = s.r * (0.7 + t*0.6);

        ctx.globalAlpha = 0.65 + t*0.35;
        ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
        ctx.fillStyle = s.color; ctx.fill();

        ctx.globalAlpha = 0.15 + t*0.15;
        ctx.beginPath(); ctx.arc(s.x,s.y,r*2.2,0,Math.PI*2);
        ctx.fillStyle = s.color; ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => { resize(); };
    resize(); draw();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />;
}

// ---------- data ----------
const CUBS: CubItem[] = [
  { id: 'BD',         label: 'BD Agent',         tagline: 'Helps You Sell your Products and onboards Investors', icon: '/images/cubs/bd.png' },
  { id: 'Content',    label: 'Content Agent',    tagline: 'Generates Media for Social Awareness and Brand Growth', icon: '/images/cubs/content.png' },
  { id: 'Support',    label: 'Private AI Agent',    tagline: 'Handles Support to increase Retention', icon: '/images/cubs/support.png' },
  { id: 'Trading',    label: 'Trading Agent',    tagline: 'Helps You Trade Perpetuals', icon: '/images/cubs/trading.png' },
  { id: 'Prediction', label: 'Prediction Agent', tagline: 'Forecasts Trends on Prediction Markets', icon: '/images/cubs/prediction.png' },
  { id: 'Treasury',   label: 'Treasury Agent',   tagline: 'Grows your Treasury Safely', icon: '/images/cubs/treasury.png' },
];

type Flying = {
  key: string;
  src: string;
  from: { x:number; y:number; w:number; h:number };
  to:   { x:number; y:number; w:number; h:number };
};

export default function AgentPicker() {
  const { items, add, remove, clear, setPickerOpen, setFormOpen } = useAgentCart();

  const cartRef = useRef<HTMLDivElement | null>(null);
  const imgRefs = useRef<Record<string, HTMLImageElement | null>>({});

  // helper to satisfy React's ref signature (must return void)
  const setImgRef = useCallback((id: string) => {
    return (el: HTMLImageElement | null): void => {
      imgRefs.current[id] = el;
    };
  }, []);

  const [flying, setFlying] = useState<Flying[]>([]);

  const flyToCartAndAdd = (cub: CubItem) => {
    const img = imgRefs.current[cub.id];
    const cart = cartRef.current;
    if (!img || !cart) { add(cub); return; }

    const ir = img.getBoundingClientRect();
    const cr = cart.getBoundingClientRect();

    const f: Flying = {
      key: `${cub.id}-${Date.now()}`,
      src: cub.icon,
      from: { x: ir.left, y: ir.top, w: ir.width, h: ir.height },
      to:   { x: cr.left + cr.width/2, y: cr.top + cr.height/2, w: 28, h: 28 },
    };
    setFlying(prev => [...prev, f]);
  };

  const onFlyDone = (key: string, cub?: CubItem) => {
    setFlying(prev => prev.filter(f => f.key !== key));
    if (cub) add(cub);
  };

  return (
    <>
      <Starfield />
<div
  className="fixed inset-0 z-[110] flex justify-center items-start md:items-center
             p-4 md:p-6 overflow-y-auto overscroll-contain"
  style={{ touchAction: 'pan-y' }}
  onClick={() => setPickerOpen(false)}
>        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
        <div
    className="relative z-[120] w-full max-w-5xl mx-auto
               bg-[#0D0F1E]/95 border border-[#283056] rounded-2xl
               p-6 shadow-2xl
               max-h-[85vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
  >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold">Create your own suite of agents</h2>
            <button className="text-sm opacity-70 hover:opacity-100" onClick={() => setPickerOpen(false)}>Close</button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CUBS.map((cub) => {
              const selected = items.some((i) => i.id === cub.id);
              return (
                <motion.button
                  key={cub.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (selected ? remove(cub.id) : flyToCartAndAdd(cub))}
                  className={`relative rounded-2xl p-5 bg-[#141736] border ${
                    selected ? 'border-purple-400' : 'border-[#2A2F5E]'
                  } text-left transition-colors`}
                >
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#22295A] grid place-items-center">
                    <span className="text-xl">{selected ? '−' : '+'}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* plain <img> so we can grab the DOM node for animation math */}
                    <img
                      ref={setImgRef(cub.id)}
                      src={cub.icon}
                      alt={cub.label}
                      className="rounded-xl w-28 h-28 object-contain"
                    />
                    <div>
                      <div className="text-xl font-semibold">{cub.label}</div>
                      <div className="text-sm text-gray-400">{cub.tagline}</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Cart + CTA */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                ref={cartRef}
                className="relative w-14 h-14 rounded-xl bg-[#141736] grid place-items-center border border-[#2A2F5E]"
              >
                <img src="/images/cubs/cart.png" alt="Cart" className="w-12 h-12" />
                <AnimatePresence>
                  {items.length > 0 && (
                    <motion.span
                      key={`badge-${items.length}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 w-6 h-6 text-xs font-semibold rounded-full bg-purple-500 grid place-items-center"
                    >
                      {items.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-sm text-gray-300">
                {items.length === 0 ? 'Pick agents to add them to your cart' : 'Ready to proceed'}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-3 rounded-xl bg-gray-700" onClick={clear}>Clear</button>
              <button
                disabled={items.length === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setPickerOpen(false);
                  setTimeout(() => setFormOpen(true), 0);
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Flying images layer */}
          <AnimatePresence>
            {flying.map(f => (
              <motion.img
                key={f.key}
                src={f.src}
                alt=""
                initial={{
                  position: 'fixed',
                  left: f.from.x,
                  top: f.from.y,
                  width: f.from.w,
                  height: f.from.h,
                  opacity: 1,
                  zIndex: 2000,
                }}
                animate={{
                  left: f.to.x - f.to.w/2,
                  top:  f.to.y - f.to.h/2,
                  width: f.to.w,
                  height: f.to.h,
                  opacity: 0.7,
                  rotate: 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                onAnimationComplete={() => onFlyDone(f.key, CUBS.find(c => c.icon === f.src))}
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
