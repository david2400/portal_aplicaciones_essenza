// import {useTranslations} from 'next-intl';
import {FormSubcategory} from '@modules/administre/subcategory/scenes/formSubcategory';
import {IFormProps} from '@repo/ui/form/models/form.interface';
import {validationSubcategory} from '../schemas/subcategory.schema';
import {ISubcategoryRequest} from '../models/subcategory.interface';
import {SubmitHandler} from 'react-hook-form';

export const FormBase = ({initialValues, onSubmit, validationSchema}: IFormProps<any>) => {
  return (
    <FormSubcategory
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    ></FormSubcategory>
  );
};

export const AddSubcategory = () => {
  const initialValues: ISubcategoryRequest = {
    name: '',
    slug: '',
    description: '',
    category_id: 0,
  };

  const onSubmit: SubmitHandler<ISubcategoryRequest> = async (
    subcategory: ISubcategoryRequest,
    event
  ) => {
    console.log(subcategory);
    console.log(event);
    console.log(event?.target);

    console.log(event?.target.reset());
    // console.log(event?.target.onreset());
  };

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSubcategory()}
    ></FormBase>
  );
};

export const UpdateSubcategory = () => {
  const initialValues: ISubcategoryRequest = {
    name: '',
    slug: '',
    description: '',
    category_id: 0,
  };

  const onSubmit: SubmitHandler<ISubcategoryRequest> = async (
    subcategory: ISubcategoryRequest,
    event
  ) => {
    console.log(subcategory);
    console.log(event);
    console.log(event?.target);

    console.log(event?.target.reset());
    // console.log(event?.target.onreset());
  };

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSubcategory()}
    ></FormBase>
  );
};
