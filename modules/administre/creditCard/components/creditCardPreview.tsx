import classNames from 'classnames';

export interface CreditCardPreviewProps {
  number?: string;
  name?: string;
  expiry?: string;
  cvc?: string;
  focused?: string | null;
  className?: string;
}

const formatCardNumber = (value?: string) => {
  if (!value) {
    return '•••• •••• •••• ••••';
  }

  const digits = value.replace(/[^0-9]/g, '').slice(0, 16);
  const groups = digits.replace(/(.{4})/g, '$1 ').trim();
  return `${groups}${'•••• •••• •••• ••••'.slice(groups.length)}`.trim();
};

const formatExpiry = (value?: string) => {
  if (!value) {
    return 'MM/YY';
  }

  return value;
};

const formatName = (value?: string) => {
  if (!value) {
    return 'CARD HOLDER';
  }

  return value.toUpperCase();
};

const formatCvc = (value?: string) => {
  if (!value) {
    return '•••';
  }

  return value.slice(0, 4);
};

export const CreditCardPreview = ({
  number,
  name,
  expiry,
  cvc,
  focused,
  className,
}: CreditCardPreviewProps) => {
  const formattedNumber = formatCardNumber(number);
  const formattedExpiry = formatExpiry(expiry);
  const formattedName = formatName(name);
  const formattedCvc = formatCvc(cvc);

  return (
    <div
      className={classNames(
        'relative mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-600 p-6 text-white shadow-xl transition-transform duration-300 ease-out',
        className,
      )}
    >
      <div className='flex items-center justify-between text-xs uppercase tracking-wide opacity-70'>
        <span className={classNames({'text-white opacity-100': focused === 'number_card'})}>Card Number</span>
        <span className='font-medium'>Visa</span>
      </div>

      <div className='mt-3 text-lg font-semibold tracking-widest'>{formattedNumber}</div>

      <div className='mt-6 grid grid-cols-12 gap-3 text-xs uppercase tracking-wide opacity-70'>
        <div className='col-span-7 flex flex-col'>
          <span className={classNames({'text-white opacity-100': focused === 'name_card'})}>Card Holder</span>
          <span className='mt-1 text-sm font-medium tracking-wider text-white'>{formattedName}</span>
        </div>
        <div className='col-span-3 flex flex-col text-right'>
          <span className={classNames({'text-white opacity-100': focused === 'expiry'})}>Expires</span>
          <span className='mt-1 text-sm font-medium tracking-wider text-white'>{formattedExpiry}</span>
        </div>
        <div className='col-span-2 flex flex-col text-right'>
          <span className={classNames({'text-white opacity-100': focused === 'cvc'})}>CVC</span>
          <span className='mt-1 text-sm font-medium tracking-wider text-white'>{formattedCvc}</span>
        </div>
      </div>

      <div className='pointer-events-none absolute inset-x-0 -bottom-24 h-48 rotate-12 bg-white/15 blur-3xl' />
    </div>
  );
};
