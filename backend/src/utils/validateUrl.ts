/**
 * Utility for validating public API URLs and preventing SSRF / internal network scans.
 */

function parseIPv4(hostname: string): [number, number, number, number] | null {
  const parts = hostname.split(".");
  if (parts.length < 1 || parts.length > 4) return null;

  const parsedParts: number[] = [];
  for (const part of parts) {
    if (!part) return null;
    let num: number;
    if (/^0x[0-9a-f]+$/i.test(part)) {
      num = parseInt(part, 16);
    } else if (/^0[0-7]+$/.test(part) && part.length > 1) {
      num = parseInt(part, 8);
    } else if (/^\d+$/.test(part)) {
      num = parseInt(part, 10);
    } else {
      return null;
    }
    if (isNaN(num) || num < 0 || num > 0xffffffff) return null;
    parsedParts.push(num);
  }

  let ip32: number;
  if (parsedParts.length === 1) {
    ip32 = parsedParts[0];
  } else if (parsedParts.length === 2) {
    if (parsedParts[0] > 255 || parsedParts[1] > 0xffffff) return null;
    ip32 = (parsedParts[0] << 24) + parsedParts[1];
  } else if (parsedParts.length === 3) {
    if (parsedParts[0] > 255 || parsedParts[1] > 255 || parsedParts[2] > 0xffff) return null;
    ip32 = (parsedParts[0] << 24) + (parsedParts[1] << 16) + parsedParts[2];
  } else {
    if (parsedParts.some((p) => p > 255)) return null;
    ip32 = (parsedParts[0] << 24) + (parsedParts[1] << 16) + (parsedParts[2] << 8) + parsedParts[3];
  }

  ip32 = ip32 >>> 0;
  const a = (ip32 >>> 24) & 255;
  const b = (ip32 >>> 16) & 255;
  const c = (ip32 >>> 8) & 255;
  const d = ip32 & 255;

  return [a, b, c, d];
}

export function isPublicApiUrl(urlString: string): { isValid: boolean; error?: string } {
  if (!urlString || typeof urlString !== "string") {
    return { isValid: false, error: "API URL is required." };
  }

  let url: URL;
  try {
    url = new URL(urlString.trim());
  } catch {
    return { isValid: false, error: "Please enter a valid URL (e.g. https://api.example.com/v1/chat)." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { isValid: false, error: "URL protocol must be http or https." };
  }

  const hostname = url.hostname.toLowerCase();

  // Check hostname string patterns
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "local" ||
    hostname.endsWith(".local") ||
    hostname === "internal" ||
    hostname.endsWith(".internal") ||
    hostname === "0.0.0.0" ||
    hostname === "[::]" ||
    hostname === "[::1]" ||
    hostname === "::1"
  ) {
    return { isValid: false, error: "Localhost and internal addresses are not allowed. Please specify a public API URL." };
  }

  // IPv4 numeric host normalization and range check
  const parsedIp = parseIPv4(hostname);
  if (parsedIp) {
    const [a, b] = parsedIp;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) {
      return { isValid: false, error: "Loopback IP addresses (127.x.x.x) are not allowed." };
    }
    // 0.0.0.0/8
    if (a === 0) {
      return { isValid: false, error: "Invalid IP address (0.x.x.x)." };
    }
    // 10.0.0.0/8 (Private Class A)
    if (a === 10) {
      return { isValid: false, error: "Private network IP addresses (10.x.x.x) are not allowed." };
    }
    // 172.16.0.0/12 (Private Class B)
    if (a === 172 && b >= 16 && b <= 31) {
      return { isValid: false, error: "Private network IP addresses (172.16-31.x.x) are not allowed." };
    }
    // 192.168.0.0/16 (Private Class C)
    if (a === 192 && b === 168) {
      return { isValid: false, error: "Private network IP addresses (192.168.x.x) are not allowed." };
    }
    // 169.254.0.0/16 (Link-local / AWS metadata)
    if (a === 169 && b === 254) {
      return { isValid: false, error: "Link-local IP addresses (169.254.x.x) are not allowed." };
    }
    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127) {
      return { isValid: false, error: "Carrier-grade NAT IP addresses are not allowed." };
    }
  }

  // IPv6 check (including fc00::/7 ULA range)
  const cleanHostname = hostname.replace(/^\[|\]$/g, "");
  if (
    cleanHostname === "::1" ||
    cleanHostname === "0:0:0:0:0:0:0:1" ||
    cleanHostname.startsWith("fe80:") ||
    /^f[cd][0-9a-f]{2}:/i.test(cleanHostname) ||
    cleanHostname.startsWith("fc00:") ||
    cleanHostname.startsWith("fd00:")
  ) {
    return { isValid: false, error: "Local / private IPv6 addresses are not allowed." };
  }

  return { isValid: true };
}
