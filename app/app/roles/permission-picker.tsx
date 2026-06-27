"use client";

import * as React from "react";
import { PERMISSION_GROUPS } from "@/lib/constants";

/**
 * Sélecteur de permissions groupées par domaine.
 * Émet plusieurs <input type="checkbox" name="permissions" value={key}> pour la server action.
 */
export function PermissionPicker({ defaultSelected }: { defaultSelected: string[] }) {
  const initial = React.useMemo(() => new Set(defaultSelected), [defaultSelected]);

  return (
    <fieldset className="space-y-3">
      <legend className="label mb-1">Permissions</legend>
      {PERMISSION_GROUPS.map((group) => (
        <div
          key={group.group}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {group.group}
          </p>
          <div className="space-y-1.5">
            {group.permissions.map((perm) => (
              <label
                key={perm.key}
                htmlFor={`perm-${perm.key}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--surface)]"
              >
                <input
                  id={`perm-${perm.key}`}
                  type="checkbox"
                  name="permissions"
                  value={perm.key}
                  defaultChecked={initial.has(perm.key)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    {perm.label}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">{perm.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
