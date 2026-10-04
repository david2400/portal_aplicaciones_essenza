import {useTranslations} from 'next-intl';
import {z} from 'zod';

export const validationClient = () => {
  const intl = useTranslations('Form');

  const validationSchema = z.object({
    first_name: z.string().nonempty({message: intl('requiredField')}),
    second_name: z.string().optional(),
    first_last_name: z.string().nonempty({message: intl('requiredField')}),
    second_last_name: z.string().optional(),
    type_id: z.string().nonempty({message: intl('requiredField')}),
    card_id: z.string().nonempty({message: intl('requiredField')}),
    sex: z.string().nonempty({message: intl('requiredField')}),
    gender: z.string().nonempty({message: intl('requiredField')}),
  });

  return validationSchema;
};
