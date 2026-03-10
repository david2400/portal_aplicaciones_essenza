import {FormField} from '@repo/ui/form/scenes/form-field';
import {FormSelectField} from '@repo/ui/form/scenes/form-select';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';
// import {LockClosedIcon} from '@heroicons/react/20/solid';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import { Buttons } from '@repo/ui/buttons/scenes/index';

export const FormSubcategory = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
  // const intl = useTranslations('Form');
  const intlCategory = useTranslations('ProductRegister');

  // const cities: ISelect[] = [
  //   {value: 'New York', id: 'NY'},
  //   {value: 'Rome', id: 'RM'},
  //   {value: 'London', id: 'LDN'},
  //   {value: 'Istanbul', id: 'IST'},
  //   {value: 'Paris', id: 'PRS'},
  // ];

  type SubcategoryInputs = z.infer<typeof validationSchema>;

  const {
    register,
    setError,
    formState: {isSubmitted, errors},
    handleSubmit,
  } = useForm<SubcategoryInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full px-3 py-5 grid grid-cols-12 gap-2'>
      <FormField
        id='name'
        label={intlCategory('nameProduct')}
        className='col-span-12 lg:col-span-6'
        error={errors.name?.message}
        {...register('name')}
      />

      <FormSelectField
        id='category_id'
        label={intlCategory('nameProduct')}
        data={[]}
        className='col-span-12 lg:col-span-6'
        error={errors.category_id?.message}
        {...register('category_id')}
      />

      <FormField
        id='slug'
        label={intlCategory('nameProduct')}
        className='col-span-12'
        error={errors.slug?.message}
        {...register('slug')}
      />

      <FormTextAreaField
        id='description'
        label={intlCategory('nameProduct')}
        className='col-span-12'
        // error={errors.description?.message}
        {...register('description')}
      />

      <div className='flex justify-center col-span-12'>
        <Buttons
          type='submit'
          // icon={<LockClosedIcon className='h-5 w-5' aria-hidden='true' />}
        >
          Upload Files
        </Buttons>
      </div>
    </form>
  );
};
