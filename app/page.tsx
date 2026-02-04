'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Image
          src="/logo-color.png"
          alt="STAGE"
          width={150}
          height={39}
          className="h-12 w-auto mx-auto mb-8"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Agreement Automation System...</p>
      </div>
    </div>
  );
}
