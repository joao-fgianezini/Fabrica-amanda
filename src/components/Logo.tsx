export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: { img: 'w-9 h-9', title: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-12 h-12', title: 'text-lg', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', title: 'text-3xl', sub: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-accent-500/25 blur-2xl rounded-full animate-glow" />
        <div className="absolute inset-0 bg-accent-400/10 blur-lg rounded-2xl" />
        <img
          src="/images/762904057_18120070436504665_7201693434288924363_n.jpg"
          alt="Rede Auto Ribeirão"
          className={`relative ${s.img} rounded-2xl object-cover ring-1 ring-accent-400/30 shadow-lg shadow-accent-500/20`}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`${s.title} font-extrabold text-white tracking-tight`}>
          Rede Auto
        </span>
        <span className={`${s.sub} font-bold tracking-[0.3em] text-accent-400 uppercase`}>
          Ribeirão
        </span>
      </div>
    </div>
  );
}
