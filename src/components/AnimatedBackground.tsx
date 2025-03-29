'use client'
import { useEffect } from 'react';

export default function AnimatedBackground() {
    useEffect(() => {
        const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            dx: Math.random() * 0.2 - 0.1,
            dy: Math.random() * 0.2 - 0.1
        }));

        const mouse = { x: -9999, y: -9999 }; // Inicializa fora da tela
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        function draw() {
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

                // Conexões entre pontos
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
                        ctx.shadowColor = '#00BFFF';
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }

                // Conexão com o mouse
                const dxm = star.x - mouse.x;
                const dym = star.y - mouse.y;
                const distMouse = Math.sqrt(dxm * dxm + dym * dym);

                if (distMouse < 120) {
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0,255,255,${1 - distMouse / 120})`;
                    ctx.lineWidth = 1;
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });

            requestAnimationFrame(draw);
        }

        draw();
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            id="bg-canvas"
            className="fixed inset-0 z-0 pointer-events-none"
        ></canvas>
    );
}