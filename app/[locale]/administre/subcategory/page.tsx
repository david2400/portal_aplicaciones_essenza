import {Metadata, NextPage} from 'next';
import {Subcategory} from '@/modules/administre/subcategory/components/subcategory';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: {locale: string}}): Promise<Metadata> {
  const {locale} = await Promise.resolve(params);
  const t = await getTranslations({locale, namespace: 'Titles'});

  return {
    title: t('subcategory'),
    description: 'Administra las marcas de productos en Cygnus Shop',
  };
}

const SubcategoryPage: NextPage = () => {
  return <Subcategory></Subcategory>;
};

export default SubcategoryPage;
