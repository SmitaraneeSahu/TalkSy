
import React from 'react';
import { useEffect, useRef } from 'react';

export default function useTitle(title, { restore = true } = {}) {
  const prevTitleRef = useRef(document.title);

  useEffect(() => {
    if (typeof title === 'string') {
      document.title = title;
    }

    return () => {
      if (restore) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title, restore]);
}

