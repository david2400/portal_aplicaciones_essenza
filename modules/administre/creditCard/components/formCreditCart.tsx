'use client';
import {CreditCardForm} from '@/modules/administre/creditCard/scenes/creditCardForm';
import {validationCreditCard} from '../schemas/creditCart.schema';

export const AddCreditCard = () => {
  const initialValues = {
    number_card: '',
    name_card: '',
    expiry: '',
    cvc: '',
    email: '',
    address: '',
  };

  const onSubmit = async (creditCard: object) => {};

  return (
    <CreditCardForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationCreditCard()}
    ></CreditCardForm>
  );
};
