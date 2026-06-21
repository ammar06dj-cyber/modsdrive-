/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Helper to determine if a parsed IPv4 address belongs to a forbidden local,
 * loopback, autoconfiguration (link-local), or private subnet.
 */
function isForbiddenIpv4(ipStr: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ipStr.match(ipv4Regex);
  if (!match) return false;

  const o1 = parseInt(match[1], 10);
  const o2 = parseInt(match[2], 10);
  const o3 = parseInt(match[3], 10);
  const o4 = parseInt(match[4], 10);

  // Validate standard octet boundary
  if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) {
    return true; // Malformed/unsafe IP representation
  }

  // 0.0.0.0/8 (Local system/unspecified)
  if (o1 === 0) {
    return true;
  }

  // 127.0.0.0/8 (Loopback/Localhost)
  if (o1 === 127) {
    return true;
  }

  // 10.0.0.0/8 (Private Network)
  if (o1 === 10) {
    return true;
  }

  // 172.16.0.0/12 (Private Network)
  if (o1 === 172 && (o2 >= 16 && o2 <= 31)) {
    return true;
  }

  // 192.168.0.0/16 (Private Network)
  if (o1 === 192 && o2 === 168) {
    return true;
  }

  // 169.254.0.0/16 (Link-local / Autoconfigured IPv4 address)
  if (o1 === 169 && o2 === 254) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a URL to prevent XSS, open redirection, and SSRF.
 * Only permits HTTPS protocol and blocks local/private IP ranges.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);

    // Only allow secure 'https:' protocol.
    // Explicitly rejects 'http:', 'javascript:', 'data:', 'file:', 'blob:', 'ftp:', etc.
    if (parsed.protocol !== 'https:') {
      return '';
    }

    const host = parsed.hostname.toLowerCase();

    // Block empty, missing, or space-filled hosts
    if (!host || host.trim() === '') {
      return '';
    }

    // Block standard localhost
    if (host === 'localhost') {
      return '';
    }

    // Extract the raw IP address if it is enclosed in IPv6 square brackets [...]
    let rawIp = host;
    if (rawIp.startsWith('[') && rawIp.endsWith(']')) {
      rawIp = rawIp.slice(1, -1);
    }

    // Check if the host corresponds to forbidden host definitions
    if (rawIp.includes(':')) {
      // IPv6 address validation
      const normalizedIpv6 = rawIp.trim().toLowerCase();

      // 1. Loopback Address: ::1 or 0:0:0:0:0:0:0:1 or compressed double colons
      if (
        normalizedIpv6 === '::1' || 
        normalizedIpv6 === '0:0:0:0:0:0:0:1' || 
        normalizedIpv6 === '::0:1' ||
        normalizedIpv6 === '0:0:0:0:0:0:0:0' || // Unspecified address
        normalizedIpv6 === '::'
      ) {
        return '';
      }

      // 2. Link-local unicast range: fe80::/10 (such as fe80::, fe90::, fea0::, feb0::)
      if (
        normalizedIpv6.startsWith('fe8') || 
        normalizedIpv6.startsWith('fe9') || 
        normalizedIpv6.startsWith('fea') || 
        normalizedIpv6.startsWith('feb')
      ) {
        return '';
      }

      // 3. Unique Local Addresses (ULA): fc00::/7 (fc00:: and fd00:: private spaces)
      if (normalizedIpv6.startsWith('fc') || normalizedIpv6.startsWith('fd')) {
        return '';
      }

      // 4. IPv4-mapped / IPv4-compatible IPv6 addresses (e.g. ::ffff:192.168.0.1 or ::127.0.0.1)
      if (normalizedIpv6.includes('.')) {
        const parts = normalizedIpv6.split(':');
        const ipv4Part = parts[parts.length - 1];
        if (isForbiddenIpv4(ipv4Part)) {
          return '';
        }
      }
    } else {
      // Check standard IPv4 address subnets
      if (isForbiddenIpv4(rawIp)) {
        return '';
      }
    }

    return trimmed;
  } catch (error) {
    // Invalid URL structure
    return '';
  }
}

/**
 * Checks if a URL is safe to use in the application.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  return sanitizeUrl(url) !== '';
}

/**
 * Self-running simple validations to guarantee correct functionality.
 * These serve as self-documenting test cases.
 */
export function runSanitizationSelfTests(): { passed: boolean; results: string[] } {
  const tests = [
    // Approved safe URLs
    { url: 'https://images.unsplash.com/photo-1617469767053', expectedSafe: true },
    { url: 'https://modsfire.com/download/mod.zip', expectedSafe: true },
    { url: 'https://google.com', expectedSafe: true },

    // HTTP / unsafe protocol rejections
    { url: 'http://example.com', expectedSafe: false },
    { url: 'javascript:alert(1)', expectedSafe: false },
    { url: 'data:image/png;base64,abc', expectedSafe: false },
    { url: 'file:///etc/passwd', expectedSafe: false },
    { url: 'ftp://files.com', expectedSafe: false },

    // Localhost and loopback IPv4 rejections
    { url: 'https://localhost', expectedSafe: false },
    { url: 'https://127.0.0.1', expectedSafe: false },
    { url: 'https://127.255.255.254', expectedSafe: false },

    // Private network IPv4 rejections
    { url: 'https://10.0.0.1', expectedSafe: false },
    { url: 'https://172.16.50.4', expectedSafe: false },
    { url: 'https://172.31.255.255', expectedSafe: false },
    { url: 'https://192.168.1.100', expectedSafe: false },

    // Specific requested rejections
    { url: 'https://0.0.0.0', expectedSafe: false },
    { url: 'https://169.254.0.1', expectedSafe: false }, // link-local IPv4

    // Localhost, link-local, and ULA IPv6 rejections
    { url: 'https://[::1]', expectedSafe: false },
    { url: 'https://[0:0:0:0:0:0:0:1]', expectedSafe: false },
    { url: 'https://[::]', expectedSafe: false },
    { url: 'https://[fe80::1]', expectedSafe: false },
    { url: 'https://[fc00::100]', expectedSafe: false },
    { url: 'https://[fd12:3456:789a:1::1]', expectedSafe: false },

    // IPv4-mapped/compatible IPv6 rejections
    { url: 'https://[::ffff:127.0.0.1]', expectedSafe: false },
    { url: 'https://[::ffff:192.168.1.1]', expectedSafe: false },
    { url: 'https://[::ffff:10.0.0.1]', expectedSafe: false },
    { url: 'https://[::127.0.0.1]', expectedSafe: false },

    // Invalid structure rejections
    { url: '', expectedSafe: false },
    { url: '   ', expectedSafe: false },
    { url: 'https://', expectedSafe: false },
  ];

  let passed = true;
  const results: string[] = [];

  for (const t of tests) {
    const isSafe = isSafeUrl(t.url);
    const success = isSafe === t.expectedSafe;
    if (!success) {
      passed = false;
    }
    results.push(`URL: ${t.url || '<empty>'} -> Expected Safe: ${t.expectedSafe}, Got: ${isSafe} (${success ? 'PASS' : 'FAIL'})`);
  }

  return { passed, results };
}
