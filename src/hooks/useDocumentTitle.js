import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} - BEM Politeknik Caltex Riau` : 'BEM Politeknik Caltex Riau';
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
