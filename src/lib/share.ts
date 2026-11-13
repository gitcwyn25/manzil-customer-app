/** Builds an absolute in-app URL from a safe, app-relative path. */
export function appUrl(path: string): string {
  const safe = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${safe}`;
}

export async function copyLink(path: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(appUrl(path));
    return true;
  } catch {
    return false;
  }
}

/** Native share sheet when available (mobile), otherwise copies the link. */
export async function shareLink(path: string, title: string): Promise<"shared" | "copied" | "failed"> {
  const url = appUrl(path);
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return "failed";
    }
  }
  return (await copyLink(path)) ? "copied" : "failed";
}
