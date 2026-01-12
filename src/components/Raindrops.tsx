import { useEffect, useRef, type JSX } from "react";

type Raindrop = {
  x: number;
  y: number;
  speed: number;
  length: number;
};

type MousePosition = {
  x: number;
  y: number;
};

const UMBRELLA_RADIUS = 100;
const DROP_SPAWN_RATE = 10;

export default function Raindrops(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Raindrop[]>([]);
  const mouseRef = useRef<MousePosition>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent): void => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);

    const spawnDrops = (): void => {
      for (let i = 0; i < DROP_SPAWN_RATE; i++) {
        dropsRef.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          speed: 4 + Math.random() * 4,
          length: 10 + Math.random() * 10,
        });
      }
    };

    const updateDrops = (): void => {
      const { x: mx, y: my } = mouseRef.current;

      dropsRef.current = dropsRef.current.filter((drop) => {
        drop.y += drop.speed;

        const dx = drop.x - mx;
        const dy = drop.y - my;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Absorbed by umbrella (only above the mouse)
        if (distance < UMBRELLA_RADIUS && drop.y < my) {
          return false;
        }

        return drop.y < canvas.height;
      });
    };

    const drawDrops = (): void => {
      ctx.strokeStyle = "rgba(100,150,255,0.7)";
      ctx.lineWidth = 2;

      for (const drop of dropsRef.current) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
      }
    };

    const drawUmbrella = (): void => {
      const { x, y } = mouseRef.current;

      ctx.beginPath();
      ctx.arc(x, y, UMBRELLA_RADIUS, Math.PI, 0);
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Handle
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 30);
      ctx.stroke();
    };

    let animationFrameId: number;

    const loop = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnDrops();
      updateDrops();
      drawDrops();
      drawUmbrella();

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
