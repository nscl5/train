'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('key');
    setData(stored);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <div>{data}</div>;
}
