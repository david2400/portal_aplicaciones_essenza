import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useTranslations} from 'next-intl';
import {FormField} from '@repo/ui/form/scenes/form-field';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';

export const FormUser = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
  const intl = useTranslations('Form');
  type UserInputs = z.infer<typeof validationSchema>;

  const {
    register,
    formState: {isSubmitting, errors},
    handleSubmit,
  } = useForm<UserInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      <div className='grid grid-cols-12 gap-3'>
        <FormField
          id='username'
          label={intl('username')}
          // name='username'
          className='col-span-12 lg:col-span-6'
          {...register('username', {required: true})}
        />

        <FormField
          type='password'
          id='password'
          label={intl('username')}
          className='lg:col-span-6 col-span-12'
          {...register('password', {required: true})}
        />

        <FormField
          type='password'
          id='confirmPassword'
          label={intl('username')}
          className='lg:col-span-6 col-span-12'
          {...register('name', {required: true})}
        />

        <FormTextAreaField
          id='address'
          label={intl('username')}
          className='col-span-12'
          {...register('name', {required: true})}
        />

        <div className='col-span-12 gap-2 my-4'>
          <Buttons
            type='submit'
            id='signUp'
            // label={intl.formatMessage({id: 'register'})}
            className='w-full'
            loading={isSubmitting}
          ></Buttons>
        </div>
      </div>
    </form>
  );
};
