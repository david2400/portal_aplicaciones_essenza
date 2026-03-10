import {Metadata, NextPage} from 'next';
import {Category} from '@/modules/administre/category/components/category';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: {locale: string}}): Promise<Metadata> {
  const {locale} = await Promise.resolve(params);
  const t = await getTranslations({locale, namespace: 'Titles'});

  return {
    title: t('category'),
    description: 'Administra las marcas de productos en Cygnus Shop',
  };
}

const CategoryPage: NextPage = () => {
  return <Category></Category>;
};

export default CategoryPage;
