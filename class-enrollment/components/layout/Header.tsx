'use client';

import React from 'react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#050816d9] backdrop-blur-xl border-b border-border-strong">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="h-14 sm:h-16 flex items-center justify-center sm:justify-start">
          <Image
            src="/logo.png"
            alt="SuperfastSAT"
            width={180}
            height={36}
            className="h-7 sm:h-8 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  );
}
