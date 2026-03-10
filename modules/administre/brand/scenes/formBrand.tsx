import {useTranslations} from 'next-intl';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
// import {useTranslations} from 'next-intl';
import {FormField} from '@repo/ui/form/scenes/form-field';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';
// import {LockClosedIcon} from '@heroicons/react/20/solid';
import { IFormProps } from "@repo/ui/interfaces/form/models/form.interface";
import {Buttons} from '@repo/ui/buttons/scenes/index';

export const FormBrand = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
  const intlBrand = useTranslations('ProductRegister');

  type BrandInputs = z.infer<typeof validationSchema>;

  const {
    register,
    formState: {isSubmitting, errors},
    handleSubmit,
  } = useForm<BrandInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full grid grid-cols-12 gap-2 px-3 py-5'>
      <FormField
        id='name'
        label={intlBrand('nameProduct')}
        className='col-span-12 lg:col-span-6'
        error={errors.name?.message}
        {...register('name')}
      ></FormField>

      <FormField
        id='slug'
        label={intlBrand('nameProduct')}
        className='w-full col-span-12 lg:col-span-6'
        error={errors.slug?.message}
        {...register('slug')}
      ></FormField>

      <FormTextAreaField
        id='description'
        label={intlBrand('description')}
        className='col-span-12'
        {...register('description')}
      />

      <div className='flex col-span-12 justify-center'>
        <Buttons
          type='submit'
          className='flex items-center gap-3'
          color='success'
          // icon={<LockClosedIcon className='h-5 w-5' aria-hidden='true' />}
          loading={isSubmitting}
        >
          Upload Files
        </Buttons>
      </div>
    </form>
  );
};
