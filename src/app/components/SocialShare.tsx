'use client';

import { useEffect, useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';

interface SocialShareProps {
  href: string;
  title: string;
  text: string;
  label: string;
  className?: string;
  iconOnly?: boolean;
}

export default function SocialShare({
  href,
  title,
  text,
  label,
  className = '',
  iconOnly = false,
}: SocialShareProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setShareUrl(new URL(href, window.location.origin).toString());
  }, [href]);

  const share = async () => {
    if (!shareUrl) return;
    setMessage('');

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Could not open the device share menu:', error);
          setMessage('Sharing is unavailable on this device.');
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage('Signup link copied.');
    } catch (error: unknown) {
      console.error('Could not copy the signup link:', error);
      setMessage('Could not copy the link. Please try again.');
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMessage = encodeURIComponent(text);
  const whatsappMessage = encodeURIComponent(`${text} ${shareUrl}`);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void share()}
        disabled={!shareUrl}
        aria-label={label}
        title={label}
        className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
          iconOnly ? 'h-9 w-9' : 'gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold'
        }`}
      >
        <ShareIcon className="h-4 w-4" aria-hidden="true" />
        {!iconOnly && label}
      </button>
      <a
        href={shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share on Facebook: ${title}`}
        aria-disabled={!shareUrl}
        tabIndex={shareUrl ? 0 : -1}
        title="Share on Facebook"
        className={`inline-flex shrink-0 items-center justify-center bg-[#1877F2] text-white transition hover:bg-[#166FE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-60 ${
          iconOnly ? 'h-9 w-9 rounded-lg' : 'rounded-lg px-3 py-2 text-sm font-semibold'
        }`}
      >
        {iconOnly ? <FaFacebookF className="h-4 w-4" aria-hidden="true" /> : 'Facebook'}
      </a>
      <a
        href={shareUrl ? `https://wa.me/?text=${whatsappMessage}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share on WhatsApp: ${title}`}
        aria-disabled={!shareUrl}
        tabIndex={shareUrl ? 0 : -1}
        title="Share on WhatsApp"
        className={`inline-flex shrink-0 items-center justify-center bg-[#25D366] text-white transition hover:bg-[#1EBE5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-60 ${
          iconOnly ? 'h-9 w-9 rounded-lg' : 'rounded-lg px-3 py-2 text-sm font-semibold'
        }`}
      >
        {iconOnly ? <FaWhatsapp className="h-5 w-5" aria-hidden="true" /> : 'WhatsApp'}
      </a>
      {message && (
        <span className="basis-full text-sm text-gray-600 dark:text-gray-300" role="status">
          {message}
        </span>
      )}
    </div>
  );
}
