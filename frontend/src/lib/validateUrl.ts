/**
 * Utility for validating public API URLs and preventing local / SSRF addresses.
 */
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

  // IPv4 regexes for loopback, private ranges, link-local, carrier-grade NAT
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, aStr, bStr, cStr, dStr] = ipv4Match;
    const a = parseInt(aStr, 10);
    const b = parseInt(bStr, 10);

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

  // IPv6 check
  const cleanHostname = hostname.replace(/^\[|\]$/g, "");
  if (
    cleanHostname === "::1" ||
    cleanHostname === "0:0:0:0:0:0:0:1" ||
    cleanHostname.startsWith("fe80:") ||
    cleanHostname.startsWith("fc00:") ||
    cleanHostname.startsWith("fd00:")
  ) {
    return { isValid: false, error: "Local / private IPv6 addresses are not allowed." };
  }

  return { isValid: true };
}
