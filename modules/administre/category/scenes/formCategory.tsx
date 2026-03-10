import {FormField} from '@repo/ui/form/scenes/form-field';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';
// import {LockClosedIcon} from '@heroicons/react/20/solid';
import {ICategory} from '@/shared/models/category';
import {z} from 'zod';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {useForm} from 'react-hook-form';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';

export const FormCategory = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
  const intl = useTranslations('Form');
  const intlCategory = useTranslations('ProductRegister');

  type CategoryInputs = z.infer<typeof validationSchema>;

  const {
    register,
    setError,
    formState: {isSubmitting, errors},
    handleSubmit,
  } = useForm<CategoryInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full grid grid-cols-12 gap-6 px-3 py-5'>
      <FormField
        id='name'
        label={intlCategory('nameProduct')}
        className='col-span-12 lg:col-span-6'
        error={errors.name?.message}
        {...register('name', {required: true})}
      ></FormField>

      <FormField
        id='slug'
        label={intlCategory('nameProduct')}
        // label={intlCategory.formatMessage({id: 'brand'})}
        className='col-span-12 lg:col-span-6'
        error={errors.slug?.message}
        {...register('slug', {required: true})}
      ></FormField>

      <FormTextAreaField
        id='description'
        label={intlCategory('nameProduct')}
        // label={intlCategory.formatMessage({id: 'description'})}
        className='col-span-12'
        // error={errors}
        {...register('description', {required: true})}
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
