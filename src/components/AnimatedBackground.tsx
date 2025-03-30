'use client'
import { useEffect } from 'react';

export default function AnimatedBackground() {
    useEffect(() => {
        const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        // Retina support
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(ratio, ratio);

        const isMobile = width <= 768;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const starCount = isMobile ? 40 : 100;
        const stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            dx: Math.random() * 0.2 - 0.1,
            dy: Math.random() * 0.2 - 0.1
        }));

        const mouse = { x: -9999, y: -9999 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId: number;
        let lastFrame = 0;
        const fps = 30;
        const interval = 1000 / fps;

        function draw(time: number) {
            if (time - lastFrame < interval) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }
            lastFrame = time;

            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            stars.forEach((star, i) => {
                star.x += star.dx;
                star.y += star.dy;

                if (star.x < 0 || star.x > width) star.dx *= -1;
                if (star.y < 0 || star.y > height) star.dy *= -1;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 191, 255, ${star.alpha})`;
                ctx.fill();

                for (let j = i + 1; j < stars.length; j++) {
                    const other = stars[j];
                    const dx = star.x - other.x;
                    const dy = star.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(0,191,255,${1 - dist / 100})`;
                        ctx.lineWidth = 0.5;
                        if (!isMobile) {
                            ctx.shadowColor = '#00BFFF';
                            ctx.shadowBlur = 8;
                        }
                        ctx.stroke();
                        if (!isMobile) ctx.shadowBlur = 0;
                    }
                }

                const dxm = star.x - mouse.x;
                const dym = star.y - mouse.y;
                const distMouse = Math.sqrt(dxm * dxm + dym * dym);
                if (distMouse < 120) {
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0,255,255,${1 - distMouse / 120})`;
                    ctx.lineWidth = 1;
                    if (!isMobile) {
                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 10;
                    }
                    ctx.stroke();
                    if (!isMobile) ctx.shadowBlur = 0;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        }

        if (!prefersReducedMotion) {
            animationFrameId = requestAnimationFrame(draw);
        }

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(ratio, ratio);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            id="bg-canvas"
            className="fixed inset-0 z-0 pointer-events-none bg-gray-900"
        ></canvas>
    );
}
