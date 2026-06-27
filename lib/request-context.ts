import { headers } from "next/headers";

export type RequestContext = {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceLabel: string;
};

/** Parse minimaliste d'un user-agent pour la gestion des appareils. */
export function parseUserAgent(ua: string): { browser: string; os: string; deviceLabel: string } {
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Navigateur inconnu";

  const os =
    /Windows NT 10/.test(ua) ? "Windows"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Android/.test(ua) ? "Android"
    : /(iPhone|iPad|iPod)/.test(ua) ? "iOS"
    : /Linux/.test(ua) ? "Linux"
    : "Système inconnu";

  return { browser, os, deviceLabel: `${browser} sur ${os}` };
}

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = h.get("user-agent") ?? "inconnu";
  const { browser, os, deviceLabel } = parseUserAgent(userAgent);
  return { ipAddress, userAgent, browser, os, deviceLabel };
}
