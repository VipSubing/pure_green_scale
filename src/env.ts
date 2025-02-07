import _manifest from "@/manifest.json";

// const
// Export manifest for external use
export const manifest = _manifest;
export const ISDEV = manifest.env.USER_ENV === "dev";
