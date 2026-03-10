import {useState} from 'react';
import {SubmitHandler} from 'react-hook-form';
import {FormBrand} from '@modules/administre/brand/scenes/formBrand';
import {IFormProps, IFormUpdateProps} from '@repo/ui/interfaces/form/models/form.interface';
import {validationBrand} from '../schemas/brand.schema';
import {IBrandAddRequest, IBrandUpdateRequest} from '../models/brand.interface';
import {create_brand_service, update_brand_service} from '../services/brand-actions';

const FormBase = ({initialValues, onSubmit, validationSchema}: IFormProps<any>) => {
  return (
    <FormBrand
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    ></FormBrand>
  );
};

export const AddBrand = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues: IBrandAddRequest = {
    name: '',
    slug: '',
    description: '',
  };
  const onSubmit: SubmitHandler<IBrandAddRequest> = async (brand: IBrandAddRequest, event) => {
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    const result = await create_brand_service(brand);
    setIsSubmitting(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormSuccess('La marca se registró correctamente.');
    event?.target?.reset();
  };

  const validationSchema = validationBrand();

  return (
    <div className='space-y-3'>
      <FormBase
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      />
      {isSubmitting && <p className='text-sm text-muted-foreground'>Guardando...</p>}
      {formError && <p className='text-sm text-red-500'>{formError}</p>}
      {formSuccess && <p className='text-sm text-green-600'>{formSuccess}</p>}
    </div>
  );
};

type UpdateBrandProps = IFormUpdateProps & {
  initialValues?: IBrandUpdateRequest;
};

export const UpdateBrand = ({id, handleClose, refresh, initialValues}: UpdateBrandProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values: IBrandAddRequest = {
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    slug: initialValues?.slug ?? '',
  };

  const onSubmit: SubmitHandler<IBrandAddRequest> = async (brand: IBrandAddRequest) => {
    if (typeof id !== 'number') {
      setFormError('Identificador de marca no disponible.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    const result = await update_brand_service({ ...brand, id });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormSuccess('La marca se actualizó correctamente.');
    refresh?.();
    handleClose?.(null);
  };

  const validationSchema = validationBrand();

  return (
    <div className='space-y-3'>
      <FormBase
        initialValues={values}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      />
      {isSubmitting && <p className='text-sm text-muted-foreground'>Actualizando...</p>}
      {formError && <p className='text-sm text-red-500'>{formError}</p>}
      {formSuccess && <p className='text-sm text-green-600'>{formSuccess}</p>}
    </div>
  );
};
