'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
}

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        
        if (typeof window !== 'undefined') {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
            window.addEventListener('resize', handleResize);
        }
        
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const particles: Particle[] = [];
        const particleCount = 150;
        const colors = ['rgba(255, 255, 255, 0.5)', 'rgba(147, 51, 234, 0.3)', 'rgba(59, 130, 246, 0.3)'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    p.x -= dx * 0.01;
                    p.y -= dy * 0.01;
                }

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMouse({ x: e.clientX, y: e.clientY });
            
            // Update CSS variables for moving glass effect
            const moveX = (e.clientX - window.innerWidth / 2) / 30; // More powerful
            const moveY = (e.clientY - window.innerHeight / 2) / 30;
            
            document.documentElement.style.setProperty('--bg-move-x', `${moveX}px`);
            document.documentElement.style.setProperty('--bg-move-y', `${moveY}px`);
        };

        const handleScroll = () => {
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty('--bg-scroll-y', `${scrollY * 0.5}px`); // Parallax effect
            document.documentElement.style.setProperty('--bg-scale', `${1 + scrollY * 0.0005}`); // Scale effect
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        const rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, [dimensions, mouse.x, mouse.y]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Moving Glass Layer */}
            <div 
                className="absolute inset-[-100px] bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-[4px]"
                style={{
                    transform: `translate(var(--bg-move-x, 0px), calc(var(--bg-move-y, 0px) - var(--bg-scroll-y, 0px))) scale(var(--bg-scale, 1))`,
                    transition: 'transform 0.1s ease-out'
                }}
            />
            
            {/* Sprinkles (Particles) */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0"
                style={{ mixBlendMode: 'screen' }}
            />
            
            {/* Ambient Glows */}
            <div 
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                style={{
                    transform: `translate(calc(var(--bg-move-x, 0px) * 2), calc(var(--bg-move-y, 0px) * 2 - var(--bg-scroll-y, 0px) * 1.5))`,
                    transition: 'transform 0.15s ease-out'
                }}
            />
            <div 
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
                style={{
                    transform: `translate(calc(var(--bg-move-x, 0px) * -1.5), calc(var(--bg-move-y, 0px) * -1.5 - var(--bg-scroll-y, 0px) * 0.5))`,
                    transition: 'transform 0.2s ease-out'
                }}
            />
        </div>
    );
}
