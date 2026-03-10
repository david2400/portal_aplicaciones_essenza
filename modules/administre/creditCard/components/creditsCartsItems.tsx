'use client';
import {
  CreditCartItem,
  ICreditCartItemProps,
} from '@modules/administre/creditCard/scenes/creditsCardsItems';

export const CreditsCartItems = ({data, className}: ICreditCartItemProps) => {
  return <CreditCartItem data={data} className={className} />;
};
