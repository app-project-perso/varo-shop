import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Espace } from "@/components/varo/Espace";

export const Route = createFileRoute("/_authenticated/caisse")({
  head: () => ({ meta: [{ title: "Caisse — Varo" }, { name: "description", content: "Encaisse tes ventes." }] }),
  component: () => (
    <Espace roles={["proprietaire", "vendeur"]} ecriture>
      {() => (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-10 text-center shadow-sm">
          <ShoppingCart className="h-10 w-10 text-cta" aria-hidden />
          <h1 className="text-xl font-bold">La caisse arrive bientôt</h1>
          <p className="text-muted-foreground">Tu pourras ouvrir ta caisse et vendre ici.</p>
        </div>
      )}
    </Espace>
  ),
});
