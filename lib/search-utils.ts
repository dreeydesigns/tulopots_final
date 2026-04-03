export type SearchableEntry = {
  id: string;
  category: string;
  kind: string;
  title: string;
  summary: string;
  label: string;
  keywords: string[];
};

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function uniqueSearchTokens(value: string) {
  return Array.from(
    new Set(normalizeSearchText(value).split(' ').filter((token) => token.length > 1))
  );
}

export function levenshtein(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: right.length + 1 }, (_, row) =>
    Array.from({ length: left.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
  );

  for (let row = 1; row <= right.length; row += 1) {
    for (let col = 1; col <= left.length; col += 1) {
      const cost = left[col - 1] === right[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[right.length][left.length];
}

export function scoreSearchEntry(query: string, entry: SearchableEntry) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = uniqueSearchTokens(query);
  const searchable = normalizeSearchText(
    [entry.title, entry.summary, entry.keywords.join(' '), entry.label].join(' ')
  );
  const keywordSet = uniqueSearchTokens([entry.title, entry.keywords.join(' '), entry.summary].join(' '));

  let score = 0;

  if (searchable.includes(normalizedQuery)) {
    score += 120;
  }

  queryTokens.forEach((token) => {
    if (searchable.includes(token)) {
      score += 24;
    }

    const bestDistance = keywordSet.reduce((best, keyword) => {
      const nextDistance = levenshtein(token, keyword);
      return nextDistance < best ? nextDistance : best;
    }, Number.POSITIVE_INFINITY);

    if (bestDistance === 0) {
      score += 18;
    } else if (bestDistance === 1) {
      score += 12;
    } else if (bestDistance === 2 && token.length > 4) {
      score += 7;
    }
  });

  if (entry.kind === 'answer') {
    score += 6;
  }

  if (entry.kind === 'article') {
    score += 3;
  }

  return score;
}

export function suggestSearchQuery(query: string, entries: SearchableEntry[]) {
  const queryTokens = uniqueSearchTokens(query);
  const vocabulary = Array.from(
    new Set(
      entries.flatMap((entry) =>
        uniqueSearchTokens([entry.title, entry.keywords.join(' ')].join(' ')).filter(
          (token) => token.length > 2
        )
      )
    )
  );

  if (!queryTokens.length || !vocabulary.length) {
    return null;
  }

  const nextTokens = queryTokens.map((token) => {
    const bestMatch = vocabulary.reduce(
      (best, candidate) => {
        const distance = levenshtein(token, candidate);
        if (distance < best.distance) {
          return { candidate, distance };
        }

        return best;
      },
      { candidate: token, distance: Number.POSITIVE_INFINITY }
    );

    if (bestMatch.distance > 0 && bestMatch.distance <= Math.min(2, Math.floor(token.length / 3))) {
      return bestMatch.candidate;
    }

    return token;
  });

  const suggestion = nextTokens.join(' ');
  return suggestion !== normalizeSearchText(query) ? suggestion : null;
}

export function searchEntries<T extends SearchableEntry>(
  query: string,
  entries: T[],
  minimumScore = 20
) {
  const normalized = normalizeSearchText(query);

  if (!normalized) {
    return {
      suggestedQuery: null as string | null,
      appliedQuery: '',
      results: [] as T[],
    };
  }

  const directMatches = entries
    .map((entry) => ({
      entry,
      score: scoreSearchEntry(normalized, entry),
    }))
    .filter((item) => item.score >= minimumScore)
    .sort((left, right) => right.score - left.score)
    .map((item) => item.entry);

  if (directMatches.length) {
    return {
      suggestedQuery: null,
      appliedQuery: normalized,
      results: directMatches,
    };
  }

  const suggestedQuery = suggestSearchQuery(normalized, entries);

  if (!suggestedQuery) {
    return {
      suggestedQuery: null,
      appliedQuery: normalized,
      results: [] as T[],
    };
  }

  const suggestedMatches = entries
    .map((entry) => ({
      entry,
      score: scoreSearchEntry(suggestedQuery, entry),
    }))
    .filter((item) => item.score >= Math.max(18, minimumScore - 2))
    .sort((left, right) => right.score - left.score)
    .map((item) => item.entry);

  return {
    suggestedQuery,
    appliedQuery: suggestedQuery,
    results: suggestedMatches,
  };
}
