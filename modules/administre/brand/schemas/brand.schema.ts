import {useTranslations} from 'next-intl';
import {z} from 'zod';

export const validationBrand = () => {
  const intl = useTranslations('Form');

  const validationSchema = z.object({
    name: z.string().nonempty({message: intl('requiredField')}),
    description: z.string().optional(),
    slug: z.string().nonempty({message: intl('requiredField')}),
  });

  return validationSchema;
};
