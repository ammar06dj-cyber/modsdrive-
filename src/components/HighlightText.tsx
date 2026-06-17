import React from 'react';

interface HighlightTextProps {
  text: string;
  search: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, search }) => {
  if (!text) return null;
  if (!search || !search.trim()) return <>{text}</>;

  const cleanQuery = search.toLowerCase().trim();
  const words = cleanQuery.split(/\s+/).filter(Boolean);
  if (words.length === 0) return <>{text}</>;

  // Sort words by length descending to match longer keywords first
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const pattern = sortedWords.map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');

  try {
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = sortedWords.some(w => part.toLowerCase() === w.toLowerCase()) || regex.test(part);
          return isMatch ? (
            <span key={i} className="text-[#FF7300] bg-white/5 px-0.5 rounded border-b border-[#FF7300]/40 font-bold">
              {part}
            </span>
          ) : (
            part
          );
        })}
      </>
    );
  } catch (e) {
    // Character-by-character fallback if RegExp errors out
    const queryChars = new Set(cleanQuery.replace(/\s+/g, '').split(''));
    return (
      <>
        {text.split('').map((char, i) => {
          const isMatch = queryChars.has(char.toLowerCase());
          return isMatch ? (
            <span key={i} className="text-[#FF7300] font-bold">
              {char}
            </span>
          ) : (
            char
          );
        })}
      </>
    );
  }
};
