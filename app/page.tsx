'use client';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('key');
    setData(stored);
  }, []);

  return <div>{data}</div>;
}
