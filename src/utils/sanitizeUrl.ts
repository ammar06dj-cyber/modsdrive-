/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

    // Only allow https: protocol
    if (parsed.protocol !== 'https:') {
      return '';
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost
    if (host === 'localhost') {
      return '';
    }

    // Check for IP addresses (IPv4 loopback and private ranges)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Regex);

    if (ipMatch) {
      const o1 = parseInt(ipMatch[1], 10);
      const o2 = parseInt(ipMatch[2], 10);

      // Validate octet range
      if (o1 > 255 || o2 > 255 || parseInt(ipMatch[3], 10) > 255 || parseInt(ipMatch[4], 10) > 255) {
        return '';
      }

      // Loopback range: 127.0.0.0/8
      if (o1 === 127) {
        return '';
      }

      // Private networks:
      // 10.0.0.0/8
      if (o1 === 10) {
        return '';
      }

      // 172.16.0.0/12
      if (o1 === 172 && (o2 >= 16 && o2 <= 31)) {
        return '';
      }

      // 192.168.0.0/16
      if (o1 === 192 && o2 === 168) {
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
