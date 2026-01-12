import { useEffect, useRef, type JSX } from "react";
import umbrellaImg from "../assets/umbrella.png";

type Raindrop = {
  x: number;
  y: number;
  dy: number;
  radius: number;
};

type MousePosition = {
  x: number;
  y: number;
};

const UMBRELLA_RADIUS = 175;
const DROP_SPAWN_RATE = 10;
const GRAVITY = 0.01;

export default function Raindrops(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Raindrop[]>([]);
  const mouseRef = useRef<MousePosition>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const umbrellaImageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const umbrellaImage = new Image();  
    umbrellaImage.src = umbrellaImg;
    umbrellaImage.onload = () => {
      imageLoadedRef.current = true;
      umbrellaImageRef.current = umbrellaImage;
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
          y: -20,
          dy: 2 + Math.random() * 2,
          radius: 2 + Math.random() * 2,
        });
      }
    };

    const updateDrops = (): void => {
      const { x: mx, y: my } = mouseRef.current;

      dropsRef.current = dropsRef.current.filter((drop) => {
        drop.dy += GRAVITY
        drop.y += drop.dy;

        const dx = drop.x - mx;
        const dy = drop.y - my;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Absorbed by umbrella (only above the mouse)
        if ((mx + 75 > drop.x ) && distance < UMBRELLA_RADIUS && drop.y < my) {
          return false;
        }

        return drop.y < canvas.height + 20;
      });
    };

    const drawDrops = (): void => {
      ctx.fillStyle = "rgba(100,150,255,0.8)";

      for (const drop of dropsRef.current) {
        const r = drop.radius;
        const height = r * 5;

        ctx.beginPath();

        // Top point
        ctx.moveTo(drop.x, drop.y - height);

        // Right side down to circle
        ctx.bezierCurveTo(
          drop.x + r * 0.2, drop.y - height * 0.5,
          drop.x + r * 1.6, drop.y - r * 0.2,
          drop.x + r, drop.y
        );

        // Bottom circle
        ctx.arc(drop.x, drop.y, r, 0, Math.PI, false);

        // Left side back to point
        ctx.bezierCurveTo(
          drop.x - r * 1.6, drop.y - r * 0.2,
          drop.x - r * 0.2, drop.y - height * 0.5,
          drop.x, drop.y - height
        );

        ctx.closePath();
        ctx.fill();
      }
    };

    const drawUmbrella = (): void => {
      const { x, y } = mouseRef.current;
      if (!imageLoadedRef.current || !umbrellaImageRef.current) return;

      const img = umbrellaImageRef.current;
      const imgWidth = 350;
      const imgHeight = 350;

      // Center the umbrella image on the mouse
      ctx.drawImage(img, x - imgWidth / 2 - 50, y - imgHeight + 75, imgWidth, imgHeight);
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
