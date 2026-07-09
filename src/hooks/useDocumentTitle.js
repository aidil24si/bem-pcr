import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} - BEM Universitas` : 'BEM Universitas';
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
