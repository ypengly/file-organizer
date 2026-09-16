export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(2)} ${units[exponent]}`;
}

export const CATEGORY_COLOR: Record<string, string> = {
  Images: "bg-cat-images",
  Documents: "bg-cat-documents",
  Videos: "bg-cat-videos",
  Audio: "bg-cat-audio",
  Archives: "bg-cat-archives",
  Code: "bg-cat-code",
  Other: "bg-cat-other",
};

export const CATEGORY_TEXT_COLOR: Record<string, string> = {
  Images: "text-cat-images",
  Documents: "text-cat-documents",
  Videos: "text-cat-videos",
  Audio: "text-cat-audio",
  Archives: "text-cat-archives",
  Code: "text-cat-code",
  Other: "text-cat-other",
};

export function relativeToFolder(fullPath: string, folder: string): string {
  if (fullPath.startsWith(folder)) {
    return fullPath.slice(folder.length).replace(/^\/+/, "");
  }
  return fullPath.split("/").pop() ?? fullPath;
}
