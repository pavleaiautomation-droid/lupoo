'use client';

import { useEffect, useId, useRef } from 'react';

const positions = [
  0, 0.027, 0.069, 0.091, 0.137, 0.163, 0.196, 0.247, 0.273, 0.312, 0.334,
  0.381, 0.426, 0.457, 0.538, 0.571, 0.594, 0.643, 0.681, 0.709, 0.752, 0.774,
  0.821, 0.858, 0.883, 0.927, 0.965,
];

export default function ThinInfinityVisual() {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const path = svg.querySelector('path')!;
    const length = path.getTotalLength();
    const nodes = Array.from(svg.querySelectorAll<SVGGElement>('[data-node]'));
    const pulses = svg.querySelectorAll('.thin-infinity-pulse');
    nodes.forEach((node, i) => {
      const point = path.getPointAtLength(positions[i] * length);
      node.setAttribute('transform', `translate(${point.x} ${point.y})`);
    });
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let start: number | undefined;
    const draw = (time: number) => {
      start ??= time;
      const phase = motion.matches ? 0 : ((time - start) % 7000) / 7000;
      pulses.forEach((pulse) =>
        pulse.setAttribute('stroke-dashoffset', String(-phase * 100)),
      );
      nodes.forEach((node, i) => {
        const distance = (position: number) => {
          const delta = Math.abs(position - ((phase + 0.045) % 1));
          return Math.min(delta, 1 - delta);
        };
        // The central point is crossed twice on each trip around the loop.
        const gap =
          i === 0
            ? Math.min(distance(0), distance(0.5))
            : distance(positions[i]);
        const strength = motion.matches
          ? 0
          : Math.exp(-Math.pow(gap / 0.033, 2));
        node.firstElementChild!.setAttribute(
          'transform',
          `scale(${1 + strength * 0.9})`,
        );
        node
          .querySelector('[data-halo]')!
          .setAttribute('opacity', String(0.2 + strength * 0.65));
      });
      if (!motion.matches) frame = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      start = undefined;
      draw(performance.now());
    };
    motion.addEventListener('change', restart);
    restart();
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', restart);
    };
  }, []);
  return (
    <div className="thin-infinity-visual" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 640 360"
        fill="none"
        className="thin-infinity"
      >
        <defs>
          <path
            id={`${id}-loop`}
            pathLength="100"
            d="M320 180C262 111 224 83 168 88C56 98 56 271 168 272C229 275 273 226 320 180C367 134 411 85 472 88C584 89 584 262 472 272C416 277 378 249 320 180Z"
          />
          <filter
            id={`${id}-glow`}
            x="-30%"
            y="-60%"
            width="160%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <g strokeLinecap="round">
          <use
            href={`#${id}-loop`}
            stroke="#2198e0"
            strokeWidth="3"
            opacity=".55"
            filter={`url(#${id}-glow)`}
          />
          <use
            href={`#${id}-loop`}
            stroke="#64b8e8"
            strokeWidth="1.4"
            opacity=".85"
          />
          <use
            className="thin-infinity-pulse"
            href={`#${id}-loop`}
            stroke="#37c9f4"
            strokeWidth="4"
            strokeDasharray="9 91"
            filter={`url(#${id}-glow)`}
          />
          <use
            className="thin-infinity-pulse"
            href={`#${id}-loop`}
            stroke="#b5f4ff"
            strokeWidth="1.4"
            strokeDasharray="9 91"
          />
        </g>
        <g>
          {positions.map((position) => (
            <g key={position} data-node transform="translate(320 180)">
              <g>
                <circle
                  data-halo
                  r="7"
                  fill="#47c5f2"
                  opacity=".35"
                  filter={`url(#${id}-glow)`}
                />
                <circle r="1.3" fill="#d4f3ff" />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
