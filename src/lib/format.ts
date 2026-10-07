export function formatAr(montant: number | null | undefined): string {
  const n = Math.round(montant ?? 0);
  const abs = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${n < 0 ? "−" : ""}${abs} Ar`;
}

const TZ = "Indian/Antananarivo";

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));
}

export function formatDateHeure(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(d));
}

/** Un identifiant sans « @ » est un numéro de téléphone : on le convertit en adresse interne. */
export function identifiantVersEmail(identifiant: string): string {
  const v = identifiant.trim().toLowerCase();
  if (v.includes("@")) return v;
  const chiffres = v.replace(/[^\d]/g, "");
  return `${chiffres}@tel.varo.app`;
}

export function telephoneValide(v: string): boolean {
  return v.replace(/[^\d]/g, "").length >= 9;
}

export function telechargerCsv(nom: string, lignes: (string | number | null | undefined)[][]) {
  const csv = lignes
    .map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}
