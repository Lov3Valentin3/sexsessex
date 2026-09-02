import type { ElfAvatar as Avatar } from "@/db/schema";
export function ElfAvatar({
  avatar,
  name,
  size = 120,
}: {
  avatar: Avatar;
  name: string;
  size?: number;
}) {
  const id = name.replace(/\s+/g, "-").toLowerCase();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${name} the elf`}
      className="drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={avatar.accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={avatar.outfit} />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={`url(#${id}-bg)`} stroke="#f0c75e" strokeWidth="3" />
      <ellipse cx="28" cy="62" rx="10" ry="16" fill={avatar.skin} stroke={avatar.hat} strokeWidth="2" />
      <ellipse cx="92" cy="62" rx="10" ry="16" fill={avatar.skin} stroke={avatar.hat} strokeWidth="2" />
      <circle cx="60" cy="64" r="28" fill={avatar.skin} />
      <path d={`M32 52 Q60 8 88 52 L78 48 Q60 22 42 48 Z`} fill={avatar.hat} />
      <circle cx="60" cy="16" r="7" fill={avatar.accent} stroke="#f0c75e" strokeWidth="1.5" />
      <path d="M38 50 Q60 62 82 50" fill={avatar.hair} opacity="0.95" />
      <circle cx="50" cy="64" r="4.2" fill={avatar.eye} />
      <circle cx="70" cy="64" r="4.2" fill={avatar.eye} />
      <circle cx="51.3" cy="62.6" r="1.3" fill="#fff" />
      <circle cx="71.3" cy="62.6" r="1.3" fill="#fff" />
      <circle cx="49" cy="72" r="4" fill="#fb7185" opacity="0.55" />
      <circle cx="71" cy="72" r="4" fill="#fb7185" opacity="0.55" />
      <path d="M54 78 Q60 84 66 78" fill="none" stroke="#7a1020" strokeWidth="2" strokeLinecap="round" />
      {avatar.accessory === "glasses" ? (
        <g fill="none" stroke="#1f2937" strokeWidth="2">
          <circle cx="50" cy="64" r="7" />
          <circle cx="70" cy="64" r="7" />
          <path d="M57 64 H63" />
        </g>
      ) : null}
      {avatar.accessory === "bow" ? (
        <path d="M52 22 L60 30 L68 22 L64 34 L56 34 Z" fill="#fb7185" />
      ) : null}
      {avatar.accessory === "scarf" ? (
        <path d="M40 90 Q60 102 80 90 Q70 108 62 118 Q58 104 44 108 Z" fill={avatar.accent} />
      ) : null}
      {avatar.accessory === "bells" ? (
        <g>
          <circle cx="42" cy="96" r="5" fill="#f0c75e" />
          <circle cx="78" cy="96" r="5" fill="#f0c75e" />
        </g>
      ) : null}
      <path d="M42 92 Q60 108 78 92" fill={avatar.outfit} />
    </svg>
  );
}
