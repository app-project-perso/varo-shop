import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Varo — Ta caisse, ton stock, sous contrôle" },
      { name: "description", content: "Caisse et gestion de stock pour les petites boutiques de Madagascar." },
      { property: "og:title", content: "Varo — Ta caisse, ton stock, sous contrôle" },
      { property: "og:description", content: "Caisse et gestion de stock pour les petites boutiques de Madagascar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-4xl font-extrabold text-cta shadow-sm">
        V✓
      </div>
      <h1 className="text-4xl font-extrabold text-primary">Varo</h1>
      <p className="max-w-sm text-lg text-muted-foreground">Ta caisse, ton stock, sous contrôle.</p>
      <p className="rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
        Bientôt disponible
      </p>
    </main>
  );
}
