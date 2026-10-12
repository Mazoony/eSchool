'use client';

import { useId, useState } from 'react';

const meaningRequests = new Map<string, Promise<string>>();

function getArabicMeaning(word: string): Promise<string> {
  const normalizedWord = word.toLowerCase();
  const existingRequest = meaningRequests.get(normalizedWord);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const params = new URLSearchParams({
      q: word,
      langpair: 'en|ar',
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
    if (!response.ok) throw new Error(`Translation lookup failed (${response.status}).`);

    const result: unknown = await response.json();
    if (
      typeof result !== 'object'
      || result === null
      || !('responseStatus' in result)
      || !('responseData' in result)
      || typeof result.responseData !== 'object'
      || result.responseData === null
      || !('translatedText' in result.responseData)
      || typeof result.responseData.translatedText !== 'string'
    ) {
      throw new Error('The translation service returned an invalid response.');
    }

    if (result.responseStatus !== 200 || !result.responseData.translatedText.trim()) {
      throw new Error('No Arabic meaning was found for this word.');
    }
    return result.responseData.translatedText;
  })();

  meaningRequests.set(normalizedWord, request);
  void request.catch(() => meaningRequests.delete(normalizedWord));
  return request;
}

function TaskWord({ word }: { word: string }) {
  const tooltipId = useId();
  const [meaning, setMeaning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);

  const lookupMeaning = () => {
    setIsVisible(true);
    if (meaning || isLoading) return;

    setIsLoading(true);
    setLookupFailed(false);
    void getArabicMeaning(word)
      .then(setMeaning)
      .catch((error: unknown) => {
        console.error(`Could not look up the Arabic meaning for "${word}":`, error);
        setLookupFailed(true);
      })
      .finally(() => setIsLoading(false));
  };

  const closeMeaning = () => setIsVisible(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={lookupMeaning}
      onMouseLeave={closeMeaning}
      onFocus={lookupMeaning}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeMeaning();
      }}
    >
      <button
        type="button"
        lang="en"
        dir="ltr"
        aria-label={`Show Arabic meaning for ${word}`}
        aria-describedby={isVisible ? tooltipId : undefined}
        onClick={() => {
          if (isVisible && meaning) setIsVisible(false);
          else lookupMeaning();
        }}
        className="cursor-help rounded-sm underline decoration-dotted decoration-blue-500 underline-offset-2 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-900/40"
      >
        {word}
      </button>
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          dir="rtl"
          lang="ar"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-lg dark:bg-gray-700"
        >
          {isLoading ? 'جارٍ تحميل المعنى…' : meaning || (lookupFailed ? 'تعذّر تحميل المعنى' : '')}
        </span>
      )}
    </span>
  );
}

export default function TaskPromptMeanings({ prompt }: { prompt: string }) {
  const parts = prompt.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g);

  return (
    <p
      lang="en"
      dir="ltr"
      translate="no"
      className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-800 dark:text-gray-100"
    >
      {parts.map((part, index) => (/^[A-Za-z]+(?:['’-][A-Za-z]+)*$/.test(part)
        ? <TaskWord key={`${index}-${part}`} word={part} />
        : <span key={`${index}-text`}>{part}</span>))}
    </p>
  );
}
