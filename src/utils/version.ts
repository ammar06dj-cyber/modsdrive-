/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes a game version string to standard "0.XX.x" format if applicable.
 * For example:
 * - "v0.38" -> "0.38.x"
 * - "0.38" -> "0.38.x"
 * - "v0.24" -> "0.24.x"
 * - "1.49" -> "1.49" (remains unchanged as it's not in the 0.XX family)
 */
export function normalizeGameVersion(version: string | undefined | null): string {
  if (!version) return '';
  const trimmed = version.trim();
  const clean = trimmed.replace(/^[vV]/, '');
  const match = clean.match(/^0\.(\d+)/);
  if (match) {
    return `0.${match[1]}.x`;
  }
  return trimmed;
}

/**
 * Formats the game version for display.
 */
export function formatGameVersion(version: string | undefined | null): string {
  if (!version) return '';
  return normalizeGameVersion(version);
}
