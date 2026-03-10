import classNames from 'classnames';
// import {CreditCardIcon} from '@heroicons/react/24/outline';
import {Card} from '@repo/ui/card/scenes/card';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {CreditCardPreview} from '../components/creditCardPreview';

export interface ICreditCartItemProps {
  data: any;
  className?: string;
}

export const CreditCartItem = ({data, className}: ICreditCartItemProps) => {
  // const intl = useTranslations('Form');

  return (
    <Card className={classNames(className, 'flex w-full max-w-sm flex-col shadow-none mx-auto')}>
      <CreditCardPreview
        name={data?.holderName ?? 'John Smith'}
        number={data?.cardNumber ?? '5555 4444 3333 1111'}
        expiry={data?.expiry ?? '10/20'}
        cvc={data?.cvc ?? '737'}
        className='shadow-none'
      />
      <div className='flex justify-between mt-6'>
        <Buttons className='rounded-full'>
          {/* <FormattedMessage id="predetermined" defaultMessage="predetermined" /> */}
        </Buttons>
        <Buttons className='rounded-full'>
          {/* <FormattedMessage id="delete" defaultMessage="delete" /> */}
        </Buttons>
      </div>
    </Card>
  );
};
