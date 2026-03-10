import {useTranslations} from 'next-intl';
import {z} from 'zod';

export const validationSubcategory = () => {
  const intl = useTranslations('Form');

  const validationSchema = z.object({
    name: z.string().nonempty(intl('requiredField')),
    description: z.string().optional(),
    slug: z.string().nonempty(intl('requiredField')),
    category_id: z.number().min(1, {message: intl('requiredField')}),
  });

  return validationSchema;
};
