// import {useTranslations} from 'next-intl';
// import {object, string, number} from 'yup';
// import {FormProduct} from '@modules/administre/products/scenes/formProduct';

// export const validation = () => {
//   const intl = useTranslations('Form');

//   const validationSchema = object({
//     name: string().required(intl('requiredField')),
//     realPrice: number().required(intl('requiredField')),
//     unitPrice: number().required(intl('requiredField')),
//     category: number()
//       .integer()
//       .min(0)
//       .required(intl('requiredField')),
//     subcategory: number()
//       .integer()
//       .min(0)
//       .required(intl('requiredField')),
//     stock: number()
//       .positive()
//       .integer()
//       .min(1)
//       .required(intl('requiredField')),
//     description: string().required(intl('requiredField')),
//   });
//   return validationSchema;
// };

// export const AddProducts = () => {
//   const initialValues = {
//     name: '',
//     stock: 0,
//     realPrice: 0,
//     unitPrice: 0,
//     description: '',
//     category: 0,
//     subcategory: 0,
//     imageURL: [],
//   };

//   const onSubmit = async (products: any): Promise<void> => {
//     alert(products);
//   };

//   return (
//     <FormProduct
//       onSubmit={onSubmit}
//       validationSchema={validation()}
//       initialValues={initialValues}
//     ></FormProduct>
//   );
// };
