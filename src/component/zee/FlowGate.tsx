'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentCart } from '@/stores/agent-cart-store';

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<{ x:number;y:number;z:number;r:number;vx:number;vy:number;color:string }[]>([]);

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

      const targetCount = Math.floor((w * h) / 1200);
      const stars = starsRef.current;
      stars.length = 0;
      for (let i = 0; i < targetCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.5 + Math.random() * 1.5,
          r: 0.4 + Math.random() * 1.2,
          vx: (Math.random() * 0.08 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
          vy: Math.random() * 0.12 + 0.02,
          color: palette[(Math.random() * palette.length) | 0],
        });
      }
    };

    const draw = () => {
      const g = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, Math.max(w,h)*0.75);
      g.addColorStop(0, 'rgba(88,28,135,0.35)');
      g.addColorStop(0.45,'rgba(30,27,75,0.45)');
      g.addColorStop(1, 'rgba(2,6,23,0.7)');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      const stars = starsRef.current;
      for (let i=0;i<stars.length;i++){
        const s = stars[i];
        s.x += s.vx * s.z; s.y += s.vy * s.z;
        if (s.x < -5) s.x = w+5; if (s.x > w+5) s.x = -5;
        if (s.y > h+5) { s.y = -5; s.x = Math.random() * w; }

        const t = (Math.sin((Date.now()*0.002 + i) * s.z) + 1) * 0.5;
        const radius = s.r * (0.7 + t * 0.6);

        ctx.globalAlpha = 0.65 + t*0.35;
        ctx.beginPath(); ctx.arc(s.x,s.y,radius,0,Math.PI*2);
        ctx.fillStyle = s.color; ctx.fill();

        ctx.globalAlpha = 0.15 + t*0.15;
        ctx.beginPath(); ctx.arc(s.x,s.y,radius*2.2,0,Math.PI*2);
        ctx.fillStyle = s.color; ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize(); draw();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // z-[100] so it overlays the app bg but stays behind the modal panel (z-[120])
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />;
}

function VideoTile({
  src, label, onClick, poster,
}: { src: string; label: string; onClick: () => void; poster?: string }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl p-2 bg-black/20 border border-white/10 hover:border-white/20
                 transition-transform duration-200 ease-out hover:scale-[1.03] focus:outline-none"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden">
          <video
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </button>
  );
}

export default function FlowGate() {
  const router = useRouter();
  const { setFlowGateOpen, setPickerOpen } = useAgentCart();

  const handleEnterprise = () => { setFlowGateOpen(false); setPickerOpen(true); };
  const handleCoinLaunch = () => { setFlowGateOpen(false); router.push('/memelaunch'); };

  return (
    <>
      {/* Star background layer */}
      <Starfield />

      {/* Backdrop + modal. Use very high z to cover any navbar with z-50. */}
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center"
        onClick={() => setFlowGateOpen(false)}
      >
        {/* lighter blur (sm) so content stays visible */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

        <div
          className="relative z-[120] w-full max-w-4xl bg-[#0D0F1E]/95 border border-[#283056] rounded-2xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Start building your Zero Employee Enterprise</h2>
            <button className="text-sm opacity-70 hover:opacity-100" onClick={() => setFlowGateOpen(false)}>
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <VideoTile src="/videos/enterprise.mp4" label="ENTERPRISE" onClick={handleEnterprise} />
            <VideoTile src="/videos/coinlaunch.mp4" label="COIN LAUNCH" onClick={handleCoinLaunch} />
          </div>

          <div className="text-center mt-6 text-sm text-gray-300">60 seconds to ZEE</div>
          <div className="mt-2 flex justify-center">
            <button
              className="px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:opacity-90"
              onClick={handleEnterprise}
            >
              BUILD YOUR SWARM
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
