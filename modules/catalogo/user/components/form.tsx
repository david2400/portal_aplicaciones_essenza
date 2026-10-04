import {useTranslations} from 'next-intl';
import {z} from 'zod';
import {FormClient} from '../scenes/formClient';

export const validation = () => {
  const intl = useTranslations('Form');

  const validationSchema = z.object({
    name: z.string().min(15, {message: 'Invalid card string.'}),
    lastName: z.string().min(3, {message: 'Invalid CVC.'}),
    email: z.string().min(1, {message: 'Holder name is required.'}),
    address: z.string().min(4, {message: 'Invalid expiry date.'}),
    phone: z.string().min(4, {message: 'Invalid expiry date.'}),
    gender: z.string().min(4, {message: 'Invalid expiry date.'}),
    username: z.string().min(4, {message: 'Invalid expiry date.'}),
    password: z.string().min(4, {message: 'Invalid expiry date.'}),
    confirmPassword: z.string().min(4, {message: 'Invalid expiry date.'}),
  });

  return validationSchema;
};

export const RegisterUser = () => {
  const initialValues = {
    name: '',
    last_name: '',
    email: '',
    address: '',
    phone: '',
    gender: '',
    username: '',
    password: '',
    confirmPassword: '',
  };
  const onSubmit = async (values: any) => {};

  return (
    <FormClient
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validation()}
    ></FormClient>
  );
};
