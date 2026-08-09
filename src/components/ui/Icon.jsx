import React, { useId } from 'react';

const ICONS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></>,
  document: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  insights: <><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M12 3v9h9" /></>,
  download: <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  settings: <><path d="M12 3v2" /><path d="M12 19v2" /><path d="m4.93 4.93 1.42 1.42" /><path d="m17.65 17.65 1.42 1.42" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="m4.93 19.07 1.42-1.42" /><path d="m17.65 6.35 1.42-1.42" /><circle cx="12" cy="12" r="4" /></>,
  arrowDown: <><path d="M12 4v16" /><path d="m6 14 6 6 6-6" /></>,
  arrowUp: <><path d="M12 20V4" /><path d="m6 10 6-6 6 6" /></>,
  arrowRight: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
  arrowLeft: <><path d="M20 12H4" /><path d="m10 18-6-6 6-6" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  collapse: <><path d="m11 19-7-7 7-7" /><path d="m20 19-7-7 7-7" /></>,
  drawerHandle: <><path d="M8 6v12" /><path d="M12 6v12" /><path d="M16 6v12" /></>,
  filter: <><path d="M4 5h16" /><path d="M7 12h10" /><path d="M10 19h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 7h16" /><path d="M16 13h4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
  shield: <><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /></>,
  csv: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>,
  pdf: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 15h6" /><path d="M9 18h4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  alert: <><path d="m12 3 9 17H3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.8-4L3 10" /><path d="M3 5v5h5" /><path d="M4 13a8 8 0 0 0 14.8 4L21 14" /><path d="M21 19v-5h-5" /></>,
  external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>,
  copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.42 1.42" /><path d="m17.65 17.65 1.42 1.42" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 19.07 1.42-1.42" /><path d="m17.65 6.35 1.42-1.42" /></>,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" />,
  activity: <><path d="M3 12h4l2-7 4 14 2-7h6" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  trash: <><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  user: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
};

export function Icon({ name, size = 20, label, className = '' }) {
  const content = ICONS[name] || ICONS.activity;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      focusable="false"
    >
      {content}
    </svg>
  );
}

export function LogoMark({ size = 32, label = 'MoMo Statement' }) {
  const gradientId = `momo-logo-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={label} focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="28" y2="28">
          <stop offset="0" stopColor="#f3d98b" />
          <stop offset="0.48" stopColor="#d4a847" />
          <stop offset="1" stopColor="#8c5b22" />
        </linearGradient>
      </defs>
      <path d="M16 2 28 7v8c0 7-4.7 12-12 15C8.7 27 4 22 4 15V7z" fill={`url(#${gradientId})`} />
      <path d="m10 16 4 4 8-9" fill="none" stroke="#141414" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 7h10" stroke="rgba(255,255,255,.65)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
