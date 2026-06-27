import { MapPin, Building2, Warehouse, Store, UtensilsCrossed, Briefcase, Phone, Mail, Plus } from "lucide-react";
import { requireActiveCompany, requirePermission } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { ESTABLISHMENT_TYPE_META, type EstablishmentType } from "@/lib/constants";
import { EstablishmentModal } from "./establishment-modal";
import { EstablishmentActions } from "./establishment-actions";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Warehouse,
  Store,
  UtensilsCrossed,
  Briefcase,
  MapPin,
};

export default async function EstablishmentsPage() {
  const { ctx } = await requireActiveCompany();
  requirePermission(ctx, "establishments.view");
  const canManage = can(ctx, "establishments.manage");

  const establishments = await prisma.establishment.findMany({
    where: { companyId: ctx.company.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Établissements"
        description="Gérez les sites, points de vente et bureaux de votre entreprise."
        action={
          canManage ? (
            <EstablishmentModal
              trigger={
                <button className="btn btn-primary btn-sm">
                  <Plus className="size-4" />
                  Ajouter un établissement
                </button>
              }
            />
          ) : undefined
        }
      />

      {establishments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin className="size-6" />}
            title="Aucun établissement"
            description="Ajoutez votre premier site pour commencer à organiser votre activité."
            action={
              canManage ? (
                <EstablishmentModal
                  trigger={
                    <button className="btn btn-primary btn-sm">
                      <Plus className="size-4" />
                      Ajouter un établissement
                    </button>
                  }
                />
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.map((est) => {
            const meta = ESTABLISHMENT_TYPE_META[est.type as EstablishmentType] ?? ESTABLISHMENT_TYPE_META.OTHER;
            const Icon = ICONS[meta.icon] ?? MapPin;
            const addressLine = [est.postalCode, est.city].filter(Boolean).join(" ");
            return (
              <Card key={est.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-hover)]">
                      <Icon className="size-5" />
                    </span>
                    <Badge tone={est.isActive ? "success" : "neutral"} dot>
                      {est.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-2)]">{meta.label}</p>
                    <h3 className="truncate text-[0.95rem] font-semibold text-[var(--foreground)]">{est.name}</h3>
                  </div>

                  <div className="space-y-1 text-sm text-[var(--muted)]">
                    {(est.address || addressLine || est.country) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--muted-2)]" />
                        <span>
                          {est.address && <span className="block">{est.address}</span>}
                          {addressLine && <span className="block">{addressLine}</span>}
                          {est.country && <span className="block">{est.country}</span>}
                        </span>
                      </div>
                    )}
                    {est.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0 text-[var(--muted-2)]" />
                        <span>{est.phone}</span>
                      </div>
                    )}
                    {est.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 shrink-0 text-[var(--muted-2)]" />
                        <span className="truncate">{est.email}</span>
                      </div>
                    )}
                  </div>
                </CardBody>

                {canManage && (
                  <div className="flex items-center gap-2 border-t border-[var(--border)] px-5 py-3">
                    <EstablishmentActions establishment={est} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
