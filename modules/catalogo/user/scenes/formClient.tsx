import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useTranslations} from 'next-intl';
import {FormField} from '@repo/ui/form/scenes/form-field';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';
import {FormSelectField} from '@repo/ui/form/scenes/form-select';

export const FormClient = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
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
          id='first_name'
          label={intl('first_name')}
          className='col-span-12 lg:col-span-6'
          error={errors.first_name?.message}
          {...register('first_name', {required: true})}
        ></FormField>

        <FormField
          id='second_name'
          label={intl('second_name')}
          className='col-span-12 lg:col-span-6'
          error={errors.second_name?.message}
          {...register('second_name')}
        ></FormField>

        <FormField
          label={intl('first_last_name')}
          id='first_last_name'
          // name='lastName'
          error={errors.second_name?.message}
          className='col-span-12 lg:col-span-6'
          {...register('first_last_name', {required: true})}
        />

        <FormField
          label={intl('second_last_name')}
          id='second_last_name'
          // name='lastName'
          error={errors.second_last_name?.message}
          className='col-span-12 lg:col-span-6'
          {...register('second_last_name', {required: true})}
        />

        <FormSelectField
          id='type_id'
          label={intl('type_id')}
          data={[]}
          className='col-span-12 lg:col-span-6'
          error={errors.type_id?.message}
          {...register('type_id')}
        />

        <FormField
          label={intl('card_id')}
          id='card_id'
          // name='card_id'
          error={errors.card_id?.message}
          className='col-span-12 lg:col-span-6'
          {...register('card_id', {required: true})}
        />

        <FormSelectField
          id='sex'
          label={intl('sex')}
          data={[]}
          className='col-span-12 lg:col-span-6'
          error={errors.sex?.message}
          {...register('sex')}
        />

        <FormSelectField
          id='gender'
          label={intl('gender')}
          data={[]}
          className='col-span-12 lg:col-span-6'
          error={errors.gender?.message}
          {...register('gender')}
        />

        <FormField
          // label={intl.formatMessage({id: 'username'})}
          id='username'
          // name='username'
          className='col-span-12 lg:col-span-6'
          {...register('name', {required: true})}
        />

        <FormField
          type='password'
          id='password'
          // name='password'
          // onChange={handleChange}
          // label={intl.formatMessage({id: 'password'})}
          className='lg:col-span-6 col-span-12'
          {...register('name', {required: true})}
        />

        <FormField
          type='password'
          id='confirmPassword'
          // name='confirmPassword'
          // onChange={handleChange}
          // label={intl.formatMessage({id: 'confirmPassword'})}
          className='lg:col-span-6 col-span-12'
          {...register('name', {required: true})}
        />

        <FormTextAreaField
          id='address'
          // name='address'
          // label={intl.formatMessage({id: 'address'})}
          className='col-span-12'
          {...register('name', {required: true})}
        />

        {/* <div className='flex gap-4 col-span-12'>
          <label className='text-sm font-bold'>
            <FormattedMessage id='gender' defaultMessage='Male' />
          </label>
          <div className='flex align-items-center gap-2'>
            <RadioButton
                  inputId='gender'
                  name='gender'
                  value='M'
                  onChange={handleChange}
                  // checked={ingredient === 'Cheese'}
                />
            <FormattedMessage id='male' defaultMessage='male'></FormattedMessage>
          </div>
          <div className='flex align-items-center gap-2'>
            <Radio
                  id='gender'
                  name='gender'
                  value='M'
                  onChange={handleChange}
                  checked={ingredient === 'Cheese'}
                />
            <FormattedMessage id='female' defaultMessage='female'></FormattedMessage>
          </div>
        </div> */}

        <div className='col-span-12 gap-2 my-4'>
          <Buttons
            type='submit'
            id='signUp'
            // label={intl.formatMessage({id: 'register'})}
            className='w-full'
            loading={isSubmitting}
          ></Buttons>
          <p className='text-md'>
            Already have a account?
            <a href='#' className='text-blue-600 px-2'>
              Login
            </a>
          </p>
        </div>
      </div>
    </form>
  );
};
