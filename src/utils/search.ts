/**
 * Smart fuzzy and character-presence matching function for search.
 * Performs a 4-step matching logic:
 * 1. Exact substring check (case-insensitive)
 * 2. Individual words check (all words must be present in any order)
 * 3. Sequential character presence check (characters typed in order, e.g. 'm5' in 'BMW M5')
 * 4. Complete letter presence check (all alphanumeric and Arabic characters must match)
 *
 * @param name The text to be searched (name of item).
 * @param query The search query string typed by user.
 * @returns boolean indicating whether the text matches the search criteria.
 */
export function matchesSearchCriteria(name: string, query: string): boolean {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return true;

  const targetName = name.toLowerCase();

  const checkText = (text: string): boolean => {
    // 1. Exact substring check (high accuracy direct matches)
    if (text.includes(cleanQuery)) return true;

    // 2. Individual words check (contains all words, in any order)
    const words = cleanQuery.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      if (words.every(word => text.includes(word))) return true;
    }

    // 3. Sequential character presence check (characters are typed in order, e.g., 'm5' in 'BMW M5')
    let queryIdx = 0;
    for (let charIdx = 0; charIdx < text.length; charIdx++) {
      if (text[charIdx] === cleanQuery[queryIdx]) {
        queryIdx++;
      }
      if (queryIdx === cleanQuery.length) return true;
    }

    // 4. Complete letter presence check (all alphanumeric and Arabic characters typed in query must match letters in the text)
    const queryLetters = cleanQuery.replace(/[^a-z0-9\u0600-\u06FF]/g, ''); // supports English and Arabic alphabet
    if (queryLetters.length > 1) {
      let isAllPresent = true;
      for (let i = 0; i < queryLetters.length; i++) {
        if (!text.includes(queryLetters[i])) {
          isAllPresent = false;
          break;
        }
      }
      if (isAllPresent) return true;
    }

    return false;
  };

  return checkText(targetName);
}

/**
 * Advanced smart matching function that extends the search to both the name and description fields.
 *
 * @param name The name of the item.
 * @param description The description of the item.
 * @param query The search query string typed by user.
 * @returns boolean indicating whether either the name or description matches.
 */
export function matchesSearchCriteriaAdvanced(name: string, description: string, query: string): boolean {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return true;
  return matchesSearchCriteria(name, query) || matchesSearchCriteria(description || "", query);
}
