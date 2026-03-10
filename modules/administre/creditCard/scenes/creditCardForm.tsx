import {useState, FocusEvent} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormField} from '@repo/ui/form/scenes/form-field';
import {FormTextAreaField} from '@repo/ui/form/scenes/form-area';
// import {CreditCardIcon, CalendarIcon} from '@heroicons/react/24/solid';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {CreditCardPreview} from '../components/creditCardPreview';

export const CreditCardForm = ({initialValues, validationSchema, onSubmit}: IFormProps<any>) => {
  const [focused, setFocused] = useState<string | null>(null);

  const handleInputFocus = (evt: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(evt.target.name);
  };

  type CardFormInputs = z.infer<typeof validationSchema>;

  const {
    register,
    watch,
    formState: {isSubmitted, errors},
    handleSubmit,
  } = useForm<CardFormInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const values = watch();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='grid grid-cols-12 gap-4'
      action='#'
      method='POST'
    >
      <div className='w-full col-span-12 justify-center m-2'>
        <CreditCardPreview
          number={values.number_card}
          name={values.name_card}
          expiry={values.expiry}
          cvc={values.cvc}
          focused={focused}
        />
      </div>
      <FormField
        id='number_card'
        type='number'
        label={'NumberOncard'}
        placeholder='0000 0000 0000 0000'
        className='lg:col-span-6 col-span-12'
        onFocus={handleInputFocus}
        {...register('number_card')}
      />

      <FormField
        id='name_card'
        type='text'
        label={'NameOnCard'}
        // value={values.namecard}
        className='lg:col-span-6 col-span-12'
        onFocus={handleInputFocus}
        {...register('name_card')}
      />

      <FormField
        id='expiry'
        type='text'
        label={'expiry'}
        pattern='\d{2}/\d{2}'
        // value={values.expiry
        //   .replace(/[^0-9]/g, '')
        //   .replace(/(\d{2})(\d{1,2})/, '$1/$2')
        //   .substring(0, 5)}
        placeholder='MM/YY'
        className='lg:col-span-6 col-span-12'
        onFocus={handleInputFocus}
        {...register('expiry')}
      />

      <FormField
        id='cvc'
        type='text'
        label={'CVC'}
        value={values.cvc}
        className='lg:col-span-6 col-span-12'
        onFocus={handleInputFocus}
        {...register('cvc')}
      />

      <FormField
        id='email'
        type='email'
        label={'email'}
        value={values.email}
        className='col-span-12'
        onFocus={handleInputFocus}
        {...register('email')}
      />

      <FormTextAreaField
        id='address'
        value={values.address}
        label={'address'}
        className='col-span-12'
        onFocus={handleInputFocus}
        {...register('address')}
      />

      <div className='flex justify-center col-span-12'>
        <Buttons
          type='submit'
          loading={isSubmitted}
          // label={intl.formatMessage({id: 'register'})}
        >
          Guardar
        </Buttons>
      </div>
    </form>
  );
};
