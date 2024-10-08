import * as yup from 'yup';

export const productValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  // sku: yup.string().nullable().required('form:error-sku-required'),
  price: yup
    .number()
    .typeError('form:error-price-must-number')
    .min(0)
    .required('form:error-price-required'),
  quantity: yup.number().when('boundary', {
    is: (value: boolean) => value,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) =>
      schema
        .transform((value) => (isNaN(value) ? undefined : value))
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
  }),
  // unit: yup.string().required('form:error-unit-required'),
  // type: yup.object().nullable().required('form:error-type-required'),
  // status: yup.string().nullable().required('form:error-status-required'),
  variation_options: yup.array().of(
    yup.object().shape({
      price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
      // sale_price: yup
      //   .number()
      //   .transform((value) => (isNaN(value) ? undefined : value))
      //   .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
      //   .positive('form:error-sale-price-must-positive')
      //   .nullable(),
      quantity: yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
      // sku: yup.string().required('form:error-sku-required'),
      // is_digital: yup.boolean(),
      // digital_file_input: yup.object().when('is_digital', {
      //   is: true,
      //   then: () => yup.object().shape({
      //     id: yup.string().required(),
      //   }).required('Degigtal File is required'),
      //   otherwise: () => yup.object().shape({
      //     id: yup.string().notRequired(),
      //     original: yup.string().notRequired()
      //   }).notRequired().nullable()
      // }),
    }),
  ),
  // is_digital: yup.boolean(),
  // digital_file_input: yup.object().when('is_digital', {
  //   is: true,
  //   then: () => yup.object().shape({
  //     id: yup.string().required(),
  //   }),
  //   otherwise: () => yup.object().shape({
  //     id: yup.string().notRequired(),
  //     original: yup.string().notRequired()
  //   }).notRequired().nullable()
  // }),
});
