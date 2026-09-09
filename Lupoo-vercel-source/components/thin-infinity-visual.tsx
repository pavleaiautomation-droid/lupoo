'use client';

import { useEffect, useId, useRef } from 'react';

// Five irregular, intersecting circuits with independently traveling signals.
const routes = [
  'M70 190C22 109 132 30 229 68C312 100 316 208 413 235C519 266 623 184 570 117C512 44 438 114 414 184C386 267 309 326 225 286C151 251 112 260 70 190Z',
  'M112 110C161 52 269 135 339 109C410 83 477 20 537 75C599 132 502 179 487 229C468 293 538 308 450 321C354 335 342 263 279 236C207 205 68 166 112 110Z',
  'M58 250C14 181 159 153 202 120C244 89 240 22 312 37C395 55 336 161 429 176C518 190 617 238 564 286C510 337 421 268 358 285C275 309 219 339 151 309C115 293 81 286 58 250Z',
  'M84 150C61 73 169 22 244 56C318 89 275 157 355 170C447 185 504 93 561 158C621 226 514 319 444 284C368 246 333 334 260 306C180 275 213 195 150 188C118 184 96 190 84 150Z',
  'M143 278C67 291 28 215 86 168C148 119 182 213 256 179C322 149 339 60 410 48C493 34 591 99 542 156C491 216 436 193 396 257C351 330 259 264 220 289C188 309 162 302 143 278Z',
];
const positions = [
  0.019, 0.087, 0.166, 0.241, 0.353, 0.418, 0.547, 0.623, 0.739, 0.834, 0.943,
];

export default function ThinInfinityVisual() {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const tracks = routes.map((_, index) => {
      const path = svg.querySelector<SVGPathElement>(
        `[data-track="${index}"]`,
      )!;
      const length = path.getTotalLength();
      const nodes = Array.from(
        svg.querySelectorAll<SVGGElement>(`[data-node-route="${index}"]`),
      );
      nodes.forEach((node, i) => {
        const point = path.getPointAtLength(positions[i] * length);
        node.setAttribute('transform', `translate(${point.x} ${point.y})`);
      });
      return {
        nodes,
        pulses: svg.querySelectorAll(`[data-pulse-route="${index}"]`),
      };
    });
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let start: number | undefined;
    const draw = (time: number) => {
      start ??= time;
      tracks.forEach(({ nodes, pulses }, index) => {
        const phase =
          ((motion.matches ? 0 : time - start!) / (11000 + index * 3000) +
            index * 0.29) %
          1;
        pulses.forEach((pulse) =>
          pulse.setAttribute('stroke-dashoffset', String(-phase * 100)),
        );
        nodes.forEach((node, i) => {
          const delta = Math.abs(positions[i] - ((phase + 0.035) % 1));
          const gap = Math.min(delta, 1 - delta);
          const strength = motion.matches
            ? 0
            : Math.exp(-Math.pow(gap / 0.03, 2));
          node.firstElementChild!.setAttribute(
            'transform',
            `scale(${1 + strength * 0.9})`,
          );
          node
            .querySelector('[data-halo]')!
            .setAttribute('opacity', String(0.2 + strength * 0.65));
        });
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
          {routes.map((d, index) => (
            <path
              key={index}
              data-track={index}
              id={`${id}-route-${index}`}
              pathLength="100"
              d={d}
            />
          ))}
          <filter
            id={`${id}-glow`}
            x="-40%"
            y="-60%"
            width="180%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        {routes.map((_, index) => (
          <g key={index} strokeLinecap="round">
            <use
              href={`#${id}-route-${index}`}
              stroke="#2198e0"
              strokeWidth="2.5"
              opacity=".28"
              filter={`url(#${id}-glow)`}
            />
            <use
              href={`#${id}-route-${index}`}
              stroke="#64b8e8"
              strokeWidth={index === 0 ? '1.1' : '.7'}
              opacity={index === 0 ? '.7' : '.42'}
            />
            <use
              data-pulse-route={index}
              href={`#${id}-route-${index}`}
              stroke="#37c9f4"
              strokeWidth="3.5"
              strokeDasharray="7 93"
              filter={`url(#${id}-glow)`}
            />
            <use
              data-pulse-route={index}
              href={`#${id}-route-${index}`}
              stroke="#b5f4ff"
              strokeWidth="1.3"
              strokeDasharray="7 93"
            />
            {positions.map((position) => (
              <g
                key={position}
                data-node-route={index}
                transform="translate(320 180)"
              >
                <g>
                  <circle
                    data-halo
                    r="7"
                    fill="#47c5f2"
                    opacity=".2"
                    filter={`url(#${id}-glow)`}
                  />
                  <circle r={index === 0 ? '1.4' : '1.1'} fill="#d4f3ff" />
                </g>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
