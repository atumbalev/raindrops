import { useEffect, useRef, type JSX } from "react";
import defaultRainSound from "../../assets/light-rain-loop.wav";
import defaultUmbrellaImg from "../../assets/umbrella.png";

type Raindrop = {
  x: number;
  y: number;
  dy: number;
  radius: number;
  hue: number;
  alpha: number;
};

type SplashParticle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  hue: number;
};

type MousePosition = {
  x: number;
  y: number;
};

type RaindropsProps = {
  rainSound?: boolean;     // toggle rain sound
  rainVolume?: number;     // 0.0 - 1.0
  umbrella?: boolean;      // toggle umbrella effect
};

const UMBRELLA_RADIUS = 175;
const BASE_SPAWN_RATE = 0.005;
const GRAVITY = 0.08;
const SPLASH_PARTICLES = 6;
const SPLASH_GRAVITY = 0.15;

const BASE_HUE = 210;
const HUE_VARIATION = 20;

export default function Raindrops({
  rainSound = true,
  rainVolume = 0.3,
  umbrella = true,
}: RaindropsProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Raindrop[]>([]);
  const splashesRef = useRef<SplashParticle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });

  const umbrellaImageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Load umbrella image if enabled ---
    if (umbrella) {
      const umbrellaImage = new Image();
      umbrellaImage.src = defaultUmbrellaImg;
      umbrellaImage.onload = () => {
        umbrellaImageRef.current = umbrellaImage;
        imageLoadedRef.current = true;
      };
    }

    let audioCtx: AudioContext | null = null;
    let source: AudioBufferSourceNode | null = null;
    let gainNode: GainNode | null = null;

    const initAudio = async () => {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = rainVolume;
      gainNode.connect(audioCtx.destination);

      const response = await fetch(defaultRainSound);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(gainNode);

      // Resume audio context after first user interaction
      const startAudio = () => {
        audioCtx?.resume().then(() => {
          source?.start(0);
        });
        window.removeEventListener("click", startAudio);
        window.removeEventListener("keydown", startAudio);
      };

      window.addEventListener("click", startAudio);
      window.addEventListener("keydown", startAudio);
    };

    initAudio();

    // --- Resize canvas ---
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    // --- Mouse tracking ---
    const onMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    parent.addEventListener("mousemove", onMouseMove);

    // --- Spawn raindrops ---
    const spawnDrops = () => {
      const spawnCount = Math.max(1, Math.floor(canvas.width * BASE_SPAWN_RATE));
      for (let i = 0; i < spawnCount; i++) {
        dropsRef.current.push({
          x: Math.random() * canvas.width,
          y: -20,
          dy: 2 + Math.random() * 2,
          radius: 2 + Math.random() * 2,
          hue: BASE_HUE + (Math.random() - 0.5) * HUE_VARIATION,
          alpha: 0.5 + Math.random() * 0.4,
        });
      }
    };

    // --- Create splash ---
    const createSplash = (x: number, y: number, hue?: number) => {
      for (let i = 0; i < SPLASH_PARTICLES; i++) {
        splashesRef.current.push({
          x,
          y,
          dx: (Math.random() - 0.5) * 2,
          dy: -Math.random() * 2,
          life: 20 + Math.random() * 10,
          hue: hue ?? BASE_HUE,
        });
      }
    };

    // --- Update drops ---
    const updateDrops = () => {
      const { x: mx, y: my } = mouseRef.current;

      dropsRef.current = dropsRef.current.filter((drop) => {
        drop.dy += GRAVITY;
        drop.y += drop.dy;

        const dx = drop.x - mx;
        const dy = drop.y - my;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only check umbrella if enabled
        if (
          umbrella &&
          (mx + 75 > drop.x) &&
          distance < UMBRELLA_RADIUS &&
          drop.y < my
        ) {
          return false;
        }

        if (drop.y >= canvas.height - 2) {
          createSplash(drop.x, canvas.height, drop.hue);
          return false;
        }

        return true;
      });

      // Update splashes
      splashesRef.current = splashesRef.current.filter((p) => {
        p.dy += SPLASH_GRAVITY;
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        return p.life > 0;
      });
    };

    // --- Draw ---
    const drawDrops = () => {
      for (const d of dropsRef.current) {
        const r = d.radius;
        const h = r * 5;
        ctx.fillStyle = `hsla(${d.hue}, 80%, 70%, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - h);
        ctx.bezierCurveTo(
          d.x + r * 0.2, d.y - h * 0.5,
          d.x + r * 1.6, d.y - r * 0.2,
          d.x + r, d.y
        );
        ctx.arc(d.x, d.y, r, 0, Math.PI, false);
        ctx.bezierCurveTo(
          d.x - r * 1.6, d.y - r * 0.2,
          d.x - r * 0.2, d.y - h * 0.5,
          d.x, d.y - h
        );
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawSplashes = () => {
      for (const p of splashesRef.current) {
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.life / 30})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawUmbrella = () => {
      if (!umbrella || !imageLoadedRef.current || !umbrellaImageRef.current) return;
      const { x, y } = mouseRef.current;
      ctx.drawImage(
        umbrellaImageRef.current,
        x - 175 - 50,
        y - 350 + 75,
        350,
        350
      );
    };

    // --- Animation ---
    let frameId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnDrops();
      updateDrops();
      drawDrops();
      drawSplashes();
      drawUmbrella();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      source?.stop();
      audioCtx?.close();

      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      parent.removeEventListener("mousemove", onMouseMove);
    };
  }, [rainSound, rainVolume, umbrella]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
