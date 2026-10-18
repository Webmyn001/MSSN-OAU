import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface Particle {
	top: number;
	left: number;
	size: number;
	innerSize: number;
	opacity: number;
	color: string;
	velocityX: number;
	velocityY: number;
	rotation: number;
}

interface SparklesProps {
	minSize?: number;
	maxSize?: number;
	speed?: number;
	particleColor?: string;
	secondaryColor?: string;
	particleDensity?: number;
	className?: string;
}

function getRandomValue(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export function Sparkles({
	minSize = 8,
	maxSize = 16,
	speed = 12,
	particleColor = "#026d3b",
	secondaryColor = "#EBB957",
	particleDensity = 100,
	className,
}: SparklesProps) {
	const [particles, setParticles] = useState<Particle[]>([]);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const created: Particle[] = Array(particleDensity)
			.fill(null)
			.map(() => {
				const size = getRandomValue(minSize, maxSize);
				const isYellow = Math.random() < 0.2;
				return {
					top: Math.random() * 100,
					left: Math.random() * 100,
					size,
					innerSize: size * 0.6,
					opacity: getRandomValue(0.6, 0.9),
					color: isYellow ? secondaryColor : particleColor,
					velocityX: getRandomValue(-0.1, 0.1),
					velocityY: getRandomValue(-0.1, 0.1),
					rotation: getRandomValue(0, 360),
				};
			});
		setParticles(created);

		const animate = () => {
			setParticles((prev) =>
				prev.map((particle) => {
					let newTop = particle.top + particle.velocityY;
					let newLeft = particle.left + particle.velocityX;

					let newVelocityX = particle.velocityX + getRandomValue(-0.01, 0.01);
					let newVelocityY = particle.velocityY + getRandomValue(-0.01, 0.01);

					newVelocityX = Math.max(-0.2, Math.min(0.2, newVelocityX));
					newVelocityY = Math.max(-0.2, Math.min(0.2, newVelocityY));

					if (newTop < -5) newTop = 105;
					if (newTop > 105) newTop = -5;
					if (newLeft < -5) newLeft = 105;
					if (newLeft > 105) newLeft = -5;

					const newRotation = (particle.rotation + 0.1) % 360;

					return {
						...particle,
						top: newTop,
						left: newLeft,
						velocityX: newVelocityX,
						velocityY: newVelocityY,
						rotation: newRotation,
					};
				})
			);
			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [minSize, maxSize, speed, particleColor, secondaryColor, particleDensity]);

	return (
		<div className={cn("relative h-48 overflow-hidden select-none", className)}>
			<div className="absolute inset-0">
				{particles.map((particle, i) => (
					<div
						key={`cell-${i}`}
						className="absolute rounded-full"
						style={{
							width: `${particle.size}px`,
							height: `${particle.size}px`,
							backgroundColor: particle.color,
							top: `${particle.top}%`,
							left: `${particle.left}%`,
							opacity: particle.opacity,
							transform: `rotate(${particle.rotation}deg)`,
							boxShadow: `0 0 ${particle.size / 4}px ${particle.size / 8}px ${particle.color}40`,
						}}
					>
						<div
							className="absolute rounded-full bg-white/20 backdrop-blur-sm"
							style={{
								width: `${particle.innerSize}px`,
								height: `${particle.innerSize}px`,
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								boxShadow: `inset 0 0 ${particle.size / 8}px ${particle.size / 10}px rgba(0,0,0,0.2)`,
							}}
						/>
					</div>
				))}
			</div>

			<div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
			<div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
		</div>
	);
}
