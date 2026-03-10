import {NextPage} from 'next';
import {Brand} from '@/modules/administre/brand/components/brand';
import {getTranslations} from 'next-intl/server';
import type {Metadata} from 'next';

export async function generateMetadata({
  params,
}: {
  params: {locale: string};
}): Promise<Metadata> {
  const {locale} = await Promise.resolve(params);
  const t = await getTranslations({locale, namespace: 'Titles'});
  
  return {
    title: t('brand'),
    description: 'Administra las marcas de productos en Cygnus Shop',
  };
}

const BrandPage: NextPage = () => {
  return <Brand></Brand>;
};

export default BrandPage;
