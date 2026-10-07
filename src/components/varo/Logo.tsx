export function Logo({ taille = 40 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 48 48" aria-label="Varo" role="img">
      <rect width="48" height="48" rx="12" className="fill-primary" />
      <path d="M12 15 L21 34 L38 10" fill="none" className="stroke-cta" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
