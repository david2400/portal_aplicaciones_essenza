// import {useState} from 'react';
// import {useIntl, FormattedMessage} from 'next-intl';
// import {Formik, ErrorMessage} from 'formik';
// import remove from 'lodash/remove';
// import {IFormProps} from '@lib/interfaces/form/basic';
// // import {LockClosedIcon} from '@heroicons/react/20/solid';
// import {InputText} from 'primereact/inputtext';
// import {InputNumber} from 'primereact/inputnumber';
// import {FileUpload} from 'primereact/fileupload';
// import {Dropdown} from 'primereact/dropdown';
// import { Button } from "@material-tailwind/react";
// import {Editor} from 'primereact/editor';
// import {ColorPicker} from 'primereact/colorpicker';

// export const FormProduct = (props: IFormProps) => {
//   const intl = useTranslations('Form');
//   const [color, setColor] = useState<string>('ffffff');
//   const [colors, setColors] = useState<Array<string>>([]);

//   const addColor = () => {
//     const colorList = [...colors];
//     colorList.push(color);

//     setColors(colorList);
//   };

//   const deleteColor = (colorDelete: any) => {
//     const newList = [...colors];
//     const rm = remove(newList, color => {
//       return color == colorDelete;
//     });
//     setColors(newList);
//   };

//   const countries = [
//     {name: 'Australia', code: 'AU'},
//     {name: 'Brazil', code: 'BR'},
//     {name: 'China', code: 'CN'},
//     {name: 'Egypt', code: 'EG'},
//     {name: 'France', code: 'FR'},
//     {name: 'Germany', code: 'DE'},
//     {name: 'India', code: 'IN'},
//     {name: 'Japan', code: 'JP'},
//     {name: 'Spain', code: 'ES'},
//     {name: 'United States', code: 'US'},
//   ];

//   return (
//     <Formik
//       initialValues={props.initialValues}
//       validationSchema={props.validationSchema}
//       onSubmit={async (values, {resetForm, setSubmitting}) => {
//         await props
//           .onSubmit(values)
//           .then(response => {})
//           .catch(error => {})
//           .finally(() => {
//             setSubmitting(false);
//           });
//       }}
//     >
//       {({handleSubmit, handleChange, isSubmitting, errors, touched, setFieldValue, values}) => (
//         <form onSubmit={handleSubmit} className='w-full px-3 py-5' action='#' method='POST'>
//           <div className='grid grid-cols-12 gap-6'>
//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='nameProduct' defaultMessage='nameProduct'></FormattedMessage>
//               </label>
//               <InputText
//                 id='name'
//                 name='name'
//                 onChange={handleChange}
//                 // error={touched.name && Boolean(errors.name)}
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='name'
//               />
//             </div>

//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='unitPrice' defaultMessage='unitPrice'></FormattedMessage>
//               </label>
//               <InputNumber
//                 id='unitPrice'
//                 name='unitPrice'
//                 inputId='currency-us'
//                 value={values.realPrice}
//                 onChange={e => {
//                   setFieldValue('realPrice', e.value);
//                 }}
//                 mode='currency'
//                 currency='USD'
//                 locale='en-US'
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='unitPrice'
//               />
//             </div>
//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='realPrice' defaultMessage='realPrice'></FormattedMessage>
//               </label>
//               <InputNumber
//                 id='realPrice'
//                 name='realPrice'
//                 inputId='currency-us'
//                 value={values.realPrice}
//                 onChange={e => {
//                   setFieldValue('realPrice', e.value);
//                 }}
//                 mode='currency'
//                 currency='USD'
//                 locale='en-US'
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='realPrice'
//               />
//             </div>

//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='stock' defaultMessage='stock'></FormattedMessage>
//               </label>
//               <InputNumber
//                 id='stock'
//                 name='stock'
//                 inputId='minmax'
//                 value={values.stock}
//                 onValueChange={e => setFieldValue('stock', e.value)}
//                 min={0}
//                 max={100}
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='stock'
//               />
//             </div>

//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='stock' defaultMessage='stock'></FormattedMessage>
//               </label>
//               <Dropdown
//                 id='category'
//                 name='category'
//                 value={values.category}
//                 onChange={(e: any) => setFieldValue('category', e.value)}
//                 options={countries}
//                 optionLabel='name'
//                 placeholder='Select a Country'
//                 filter
//                 className='w-full'
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='category'
//               />
//             </div>
//             <div className='flex flex-col col-span-12 md:col-span-4 lg:col-span-3 gap-2'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='stock' defaultMessage='stock'></FormattedMessage>
//               </label>
//               <Dropdown
//                 id='subcategory'
//                 name='subcategory'
//                 value={values.subcategory}
//                 onChange={(e: any) => setFieldValue('subcategory', e.value)}
//                 options={countries}
//                 optionLabel='name'
//                 placeholder='Select a Country'
//                 filter
//                 className='w-full'
//               />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='subcategory'
//               />
//             </div>

//             <div className='flex flex-col col-span-12'>
//               <label className='text-sm font-bold'>
//                 <FormattedMessage id='stock' defaultMessage='stock'></FormattedMessage>
//               </label>
//               <Editor onTextChange={e => handleChange(e.htmlValue)} className='w-full' />
//               <ErrorMessage
//                 component='span'
//                 className='text-xs text-red-600 text-center w-full'
//                 name='description'
//               />
//             </div>

//             <div className='col-span-12 lg:col-span-6 my-12'>
//               <FileUpload
//                 name='demo[]'
//                 url={'/api/upload'}
//                 multiple
//                 accept='image/*'
//                 maxFileSize={1000000}
//                 emptyTemplate={<p className='m-0'>Drag and drop files to here to upload.</p>}
//               />
//             </div>
//             <div className='flex justify-start align-center col-span-12 lg:col-span-6 gap-2 my-12'>
//               <ColorPicker
//                 value={color}
//                 inputId='cp-hex'
//                 format='hex'
//                 onChange={(e: any) => setColor(e.value)}
//               />
//               <div>
//                 <Button type='button' onClick={addColor}>
//                   Agregar
//                 </Button>
//               </div>
//               <div className='w-full'>
//                 {/* {colors.map(option => (
//                   <Button type='button' className='p-2' onClick={() => deleteColor(option)} link>
//                     <div
//                       className='w-6 h-6 rounded-full border border-solid border-black'
//                       style={{backgroundColor: '#' + option}}
//                     />
//                   </Button>
//                 ))} */}
//               </div>
//             </div>
//             <div className='flex col-span-12 justify-center'>
//               <Button
//                 type='submit'
//                 className='flex items-center gap-3'
//                 // icon={<LockClosedIcon className='h-5 w-5' aria-hidden='true' />}
//               >
//                 Save
//               </Button>
//             </div>
//           </div>
//         </form>
//       )}
//     </Formik>
//   );
// };
