/* =====================================================================
   Product illustration — a jade facial roller.
   Inline SVG so the study stays a single self-contained file: no external
   image request, no licensing question, and it stays crisp at any size.
   Shown identically in all four conditions.
   ===================================================================== */

const ROLLER_SVG = `
<svg viewBox="36 44 456 168" role="img"
     aria-label="A jade facial roller: a smooth stone barrel on a slim handle, with a smaller stone barrel at the opposite end."
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fr-stone" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0"    stop-color="#e2efe7"/>
      <stop offset="0.30" stop-color="#b3d3c1"/>
      <stop offset="0.68" stop-color="#84b49c"/>
      <stop offset="1"    stop-color="#639a82"/>
    </linearGradient>
    <linearGradient id="fr-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#f6ecd8"/>
      <stop offset="0.30" stop-color="#ddc79d"/>
      <stop offset="0.66" stop-color="#c0a377"/>
      <stop offset="1"    stop-color="#9c7f57"/>
    </linearGradient>
    <linearGradient id="fr-cap" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"   stop-color="#f6ecd8"/>
      <stop offset="0.55" stop-color="#cbae82"/>
      <stop offset="1"   stop-color="#8f764f"/>
    </linearGradient>
    <radialGradient id="fr-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"    stop-color="#e9f0ea"/>
      <stop offset="0.62" stop-color="#eef2ee" stop-opacity="0.55"/>
      <stop offset="1"    stop-color="#eef2ee" stop-opacity="0"/>
    </radialGradient>
    <filter id="fr-blur" x="-40%" y="-60%" width="180%" height="220%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
  </defs>

  <!-- soft backdrop -->
  <ellipse cx="264" cy="128" rx="214" ry="86" fill="url(#fr-glow)"/>

  <g transform="rotate(-13 260 124)">

    <!-- grounding shadow, following the tool -->
    <ellipse cx="126" cy="168" rx="66" ry="9"  fill="#5c7d6c" opacity="0.18" filter="url(#fr-blur)"/>
    <ellipse cx="300" cy="150" rx="86" ry="5"  fill="#5c7d6c" opacity="0.13" filter="url(#fr-blur)"/>
    <ellipse cx="436" cy="152" rx="34" ry="6"  fill="#5c7d6c" opacity="0.15" filter="url(#fr-blur)"/>

    <!-- ================= large head ================= -->
    <!-- yoke arcing over the stone, drawn behind it -->
    <path d="M196 124 C 196 97, 166 86, 126 86 C 86 86, 56 97, 56 124"
          fill="none" stroke="url(#fr-metal)" stroke-width="6" stroke-linecap="round"/>

    <!-- handle -->
    <path d="M196 116 L392 118.5 Q398 118.6 398 124 Q398 129.4 392 129.5 L196 132 Z"
          fill="url(#fr-metal)"/>
    <path d="M198 117.6 L392 120 Q395 120.1 395 121.4 L198 121 Z"
          fill="#ffffff" opacity="0.45"/>

    <!-- stone barrel -->
    <rect x="56" y="94" width="140" height="60" rx="30" fill="url(#fr-stone)"/>
    <rect x="56" y="94" width="140" height="60" rx="30"
          fill="none" stroke="#4d8670" stroke-opacity="0.26"/>
    <path d="M82 108 Q116 100 156 103" stroke="#ffffff" stroke-opacity="0.38"
          stroke-width="6.5" stroke-linecap="round" fill="none"/>
    <path d="M92 145 Q130 152 172 144" stroke="#3f7161" stroke-opacity="0.14"
          stroke-width="8" stroke-linecap="round" fill="none"/>

    <!-- axle caps -->
    <ellipse cx="56"  cy="124" rx="7.5" ry="12" fill="url(#fr-cap)"/>
    <ellipse cx="196" cy="124" rx="7.5" ry="12" fill="url(#fr-cap)"/>

    <!-- ================= small head ================= -->
    <path d="M402 124.5 C 402 110, 419 100, 439 100 C 459 100, 476 110, 476 124.5"
          fill="none" stroke="url(#fr-metal)" stroke-width="5" stroke-linecap="round"/>

    <rect x="402" y="106" width="74" height="37" rx="18.5" fill="url(#fr-stone)"/>
    <rect x="402" y="106" width="74" height="37" rx="18.5"
          fill="none" stroke="#4d8670" stroke-opacity="0.26"/>
    <path d="M416 114 Q440 108 462 112" stroke="#ffffff" stroke-opacity="0.5"
          stroke-width="6" stroke-linecap="round" fill="none"/>

    <ellipse cx="402" cy="124.5" rx="5.5" ry="8.5" fill="url(#fr-cap)"/>
    <ellipse cx="476" cy="124.5" rx="5.5" ry="8.5" fill="url(#fr-cap)"/>
  </g>
</svg>`;
