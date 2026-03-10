import {useTranslations} from 'next-intl';
import {z} from 'zod';

export const validationCreditCard = () => {
  const intl = useTranslations('Form');

  const validationSchema = z.object({
    email: z.string().email({message: 'Invalid email.'}),
    cardNumber: z.string().min(15, {message: 'Invalid card number.'}),
    expiry: z.string().min(4, {message: 'Invalid expiry date.'}),
    cvc: z.string().min(3, {message: 'Invalid CVC.'}),
    holderName: z.string().min(1, {message: 'Holder name is required.'}),
    address: z.string().min(1, {message: 'Holder name is required.'}),
  });

  return validationSchema;
};
