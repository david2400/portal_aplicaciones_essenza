import {useState} from 'react';
import {SubmitHandler} from 'react-hook-form';
import {FormCategory} from '@modules/administre/category/scenes/formCategory';
import {IFormProps, IFormUpdateProps} from '@repo/ui/form/models/form.interface';
import {validationCategory} from '../schemas/category.schema';
import {ICategoryAddRequest, ICategoryUpdateRequest} from '../models/category.interface';
import {
  create_category_service,
  update_category_service,
} from '../services/category-actions';

const FormBase = ({initialValues, onSubmit, validationSchema}: IFormProps<any>) => {
  return (
    <FormCategory
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    ></FormCategory>
  );
};

export const AddCategory = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues: ICategoryAddRequest = {
    name: '',
    description: '',
    slug: '',
  };

  const onSubmit: SubmitHandler<ICategoryAddRequest> = async (category: ICategoryAddRequest, event) => {
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    const result = await create_category_service(category);
    setIsSubmitting(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormSuccess('La categoría se registró correctamente.');
    event?.target?.reset();
  };

  const validationSchema = validationCategory();

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

type UpdateCategoryProps = IFormUpdateProps & {
  initialValues?: ICategoryUpdateRequest;
};

export const UpdateCategory = ({id, handleClose, refresh, initialValues}: UpdateCategoryProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values: ICategoryAddRequest = {
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    slug: initialValues?.slug ?? '',
  };

  const onSubmit: SubmitHandler<ICategoryAddRequest> = async category => {
    if (typeof id !== 'number') {
      setFormError('Identificador de categoría no disponible.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    const result = await update_category_service({ ...category, id });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormSuccess('La categoría se actualizó correctamente.');
    refresh?.();
    handleClose?.(null);
  };

  const validationSchema = validationCategory();

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
