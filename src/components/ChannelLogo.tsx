import React from 'react';

export type ChannelType =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'olx'
  | 'webmotors'
  | 'mercado_livre'
  | 'site'
  | 'all'
  | string;

interface ChannelLogoProps {
  channel: ChannelType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

const SIZES = {
  xs: { box: 'w-4 h-4', icon: 12, text: 'text-[10px]' },
  sm: { box: 'w-5 h-5', icon: 14, text: 'text-xs' },
  md: { box: 'w-7 h-7', icon: 18, text: 'text-sm' },
  lg: { box: 'w-9 h-9', icon: 22, text: 'text-base' },
  xl: { box: 'w-11 h-11', icon: 28, text: 'text-lg' },
};

export function ChannelLogo({
  channel,
  size = 'md',
  className = '',
  showBadge = true,
}: ChannelLogoProps) {
  const s = SIZES[size] || SIZES.md;
  const ch = (channel || '').toLowerCase();

  // WhatsApp
  if (ch === 'whatsapp') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#25D366]/15 border border-[#25D366]/30 shadow-sm shadow-[#25D366]/10' : ''
        } ${s.box} ${className}`}
        title="WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.07 21.623a.75.75 0 00.916.915l4.52-1.343A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-1.07 4.93c-.233-.52-.477-.53-.7-.54-.182-.008-.39-.008-.6-.008s-.548.077-.834.39c-.287.312-1.096 1.072-1.096 2.614s1.122 3.03 1.278 3.238c.156.208 2.164 3.468 5.342 4.708 2.64 1.03 3.178.825 3.752.773.573-.052 1.85-.755 2.11-1.484.26-.728.26-1.353.183-1.483-.078-.13-.286-.208-.6-.364-.313-.156-1.85-.913-2.137-1.017-.286-.104-.495-.156-.703.156-.209.312-.808 1.017-.991 1.225-.182.208-.364.234-.677.078-.313-.156-1.32-.486-2.514-1.55-.93-.829-1.557-1.854-1.74-2.166-.182-.312-.019-.48.137-.636.14-.14.313-.364.469-.546.156-.182.209-.312.313-.52.104-.208.052-.39-.026-.546-.078-.156-.678-1.68-.95-2.28z"
            fill="#25D366"
          />
        </svg>
      </div>
    );
  }

  // Instagram
  if (ch === 'instagram') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#E4405F]/15 border border-[#E4405F]/30 shadow-sm shadow-[#E4405F]/10' : ''
        } ${s.box} ${className}`}
        title="Instagram Direct"
      >
        <svg
          viewBox="0 0 24 24"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5.5"
            stroke="url(#igGradient)"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="4.2" stroke="url(#igGradient)" strokeWidth="2" />
          <circle cx="17.2" cy="6.8" r="1.2" fill="url(#igGradient)" />
        </svg>
      </div>
    );
  }

  // Facebook Marketplace
  if (ch === 'facebook' || ch === 'facebook_marketplace') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#1877F2]/15 border border-[#1877F2]/30 shadow-sm shadow-[#1877F2]/10' : ''
        } ${s.box} ${className}`}
        title="Facebook Marketplace"
      >
        <svg
          viewBox="0 0 24 24"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#1877F2" />
          <path
            d="M13.5 8.5h2V5.7a18 18 0 00-2.3-.2c-2.3 0-3.9 1.4-3.9 4v2.3H6.8V15h2.5v7h3.2v-7h2.6l.4-3.2h-3v-1.9c0-.9.3-1.4 1-1.4z"
            fill="#ffffff"
          />
        </svg>
      </div>
    );
  }

  // OLX
  if (ch === 'olx') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#7E22CE]/15 border border-[#7E22CE]/35 shadow-sm shadow-[#7E22CE]/10' : ''
        } ${s.box} ${className}`}
        title="OLX Brasil"
      >
        <svg
          viewBox="0 0 32 32"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#6E0AD6" />
          {/* OLX stylized typography */}
          <text
            x="16"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="13"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="-0.5px"
          >
            olx
          </text>
        </svg>
      </div>
    );
  }

  // Webmotors
  if (ch === 'webmotors') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#E30613]/15 border border-[#E30613]/30 shadow-sm shadow-[#E30613]/10' : ''
        } ${s.box} ${className}`}
        title="Webmotors"
      >
        <svg
          viewBox="0 0 32 32"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#E30613" />
          {/* Distinctive stylized W icon */}
          <path
            d="M7 10.5h3.2l2.8 9 2.7-9h2.6l2.7 9 2.8-9H27l-4.2 13h-3.2l-2.6-8.5-2.6 8.5H11.2L7 10.5z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  // Mercado Livre
  if (ch === 'mercado_livre' || ch === 'mercadolivre') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-transform ${
          showBadge ? 'bg-[#FFE600]/20 border border-[#FFE600]/40' : ''
        } ${s.box} ${className}`}
        title="Mercado Livre"
      >
        <svg viewBox="0 0 24 24" width={s.icon} height={s.icon} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FFE600" />
          <path
            d="M8 13.5l2.5 2.5 5.5-6"
            stroke="#2D3277"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // All channels icon
  if (ch === 'all' || ch === 'todas') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 bg-accent-500/15 border border-accent-500/30 ${s.box} ${className}`}
        title="Todas as Plataformas"
      >
        <svg
          viewBox="0 0 24 24"
          width={s.icon}
          height={s.icon}
          fill="none"
          stroke="#4aaef5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      </div>
    );
  }

  // Default Site / Chat
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl flex-shrink-0 bg-accent-500/15 border border-accent-500/30 ${s.box} ${className}`}
      title="Chat do Site"
    >
      <svg
        viewBox="0 0 24 24"
        width={s.icon}
        height={s.icon}
        fill="none"
        stroke="#2a93e8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
}

export function ChannelBadge({
  channel,
  showName = true,
  size = 'sm',
  className = '',
}: {
  channel: ChannelType;
  showName?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const ch = (channel || '').toLowerCase();

  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    olx: 'OLX',
    webmotors: 'Webmotors',
    mercado_livre: 'Mercado Livre',
    site: 'Site',
    all: 'Todas',
  };

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    whatsapp: { bg: 'bg-[#25D366]/10', text: 'text-[#25D366]', border: 'border-[#25D366]/25' },
    instagram: { bg: 'bg-[#E4405F]/10', text: 'text-[#E4405F]', border: 'border-[#E4405F]/25' },
    facebook: { bg: 'bg-[#1877F2]/10', text: 'text-[#4aaef5]', border: 'border-[#1877F2]/25' },
    olx: { bg: 'bg-[#7E22CE]/10', text: 'text-[#c084fc]', border: 'border-[#7E22CE]/25' },
    webmotors: { bg: 'bg-[#E30613]/10', text: 'text-[#f87171]', border: 'border-[#E30613]/25' },
    site: { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/25' },
    all: { bg: 'bg-navy-700/40', text: 'text-white', border: 'border-navy-600/40' },
  };

  const currentTheme = colors[ch] || colors.site;
  const label = labels[ch] || channel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-semibold text-[11px] ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} ${className}`}
    >
      <ChannelLogo channel={ch} size={size} showBadge={false} />
      {showName && <span>{label}</span>}
    </span>
  );
}
