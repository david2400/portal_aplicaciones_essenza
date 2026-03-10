'use client';
import {useEffect} from 'react';
import {useTranslations} from 'next-intl';

interface UsePageTitleProps {
  titleKey: string;
  namespace?: string;
}

export const usePageTitle = ({titleKey, namespace = 'Titles'}: UsePageTitleProps) => {
  const t = useTranslations(namespace);

  useEffect(() => {
    const title = t(titleKey);
    document.title = title;
  }, [titleKey, t]);
};

// Hook para cambiar el título dinámicamente desde cualquier componente
export const useDynamicTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

