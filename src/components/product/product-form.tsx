import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Radio from '@/components/ui/radio/radio';
import Router, { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { productValidationSchema } from './product-validation-schema';
import ProductVariableForm from './product-variable-form';
import ProductSimpleForm from './product-simple-form';
import ProductGroupInput from './product-group-input';
import ProductCategoryInput from './product-category-input';
import ProductTypeInput from './product-type-input';
import { ProductType, Product, ProductStatus } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import ProductTagInput from './product-tag-input';
import { Config } from '@/config';
import Alert from '@/components/ui/alert';
import { useMemo, useState } from 'react';
import ProductAuthorInput from './product-author-input';
import ProductManufacturerInput from './product-manufacturer-input';
import { EditIcon } from '@/components/icons/edit';
import {
  getProductDefaultValues,
  getProductInputValues,
  ProductFormValues,
} from './form-utils';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/data/product';
import { split, join, isEmpty } from 'lodash';
import {
  adminOnly,
  getAuthCredentials,
  getUserAuthData,
  hasAccess,
} from '@/utils/auth-utils';
import { useSettingsQuery } from '@/data/settings';
import Tooltip from '@/components/ui/tooltip';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useCallback } from 'react';
import OpenAIButton from '@/components/openAI/openAI.button';
import { ItemProps } from '@/types';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import Link from '../ui/link';
import { EyeIcon } from '../icons/category/eyes-icon';
import { UpdateIcon } from '../icons/update';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createShopProductFn,
  editShopProductFn,
  getShopDetailsFn,
} from '@/services/shop';
import { GetShopDetailsTypeForOwner } from '@/types/shops';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';
import { getErrorMessage } from '@/utils/helpers';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a product description about ${name} in 100 words or less that highlights the key benefits of the product.`,
    },
    {
      id: 2,
      title: `Create a product description about ${name} using HTML tags and include a product ID.`,
    },
    {
      id: 3,
      title: `Write a product description about ${name} using sensory language to appeal to the reader's senses.`,
    },
    {
      id: 4,
      title: `Create a product description about ${name} that includes customer reviews and ratings.`,
    },
    {
      id: 5,
      title: `Write a product description about ${name} using storytelling techniques to create an emotional connection with the reader.`,
    },
    {
      id: 6,
      title: `Write a product description about ${name} that compares and contrasts the product with similar products on the market.`,
    },
    {
      id: 7,
      title: `Create a product description about ${name} that highlights the product's sustainability and eco-friendliness.`,
    },
    {
      id: 8,
      title: `Write a product description about ${name} that includes a list of frequently asked questions and their answers.`,
    },
    {
      id: 9,
      title: `Create a product description about ${name} that includes a video demonstration of the product in use.`,
    },
    {
      id: 10,
      title: `Write a product description about ${name} that includes a call-to-action and encourages the reader to make a purchase.`,
    },
  ];
};

type ProductFormProps = {
  initialValues?: Product | null;
};

export default function CreateOrUpdateProductForm({
  initialValues,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { locale } = router;
  // const {
  //   // @ts-ignore
  //   settings: { options },
  // } = useSettingsQuery({
  //   language: locale!,
  // });
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  // const { permissions } = getAuthCredentials();
  // let permission = hasAccess(adminOnly, permissions);
  const userAuthData = getUserAuthData();

  let statusList = [
    {
      label: 'form:input-label-under-review',
      id: 'under_review',
      value: ProductStatus.UnderReview,
    },
    {
      label: 'form:input-label-draft',
      id: 'draft',
      value: ProductStatus.Draft,
    },
  ];

  // const { data: shopData } = useShopQuery(
  //   { slug: router.query.shop as string },
  //   {
  //     enabled: !!router.query.shop,
  //   },
  // );
  // const shopId = shopData?.id!;

  const getShopQuery = useQuery(
    ['get_shop_detail', router.query.shop as string],
    () => {
      return getShopDetailsFn((router.query.shop as string) ?? '');
    },
  );

  const shopData = useMemo(() => {
    if (getShopQuery.data?.data) {
      return getShopQuery.data.data as GetShopDetailsTypeForOwner;
    }
    return null;
  }, [getShopQuery.isLoading, getShopQuery.data]);

  const isNewTranslation = router?.query?.action === 'translate';
  const showPreviewButton =
    router?.query?.action === 'edit' && Boolean(initialValues?.uid);
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const methods = useForm<ProductFormValues>({
    // @ts-ignore
    resolver: yupResolver(productValidationSchema),
    shouldUnregister: true,
    // @ts-ignore
    defaultValues: getProductDefaultValues(initialValues!, isNewTranslation),
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = methods;
  // console.log('ffreeeee', errors);
  // const upload_max_filesize = options?.server_info?.upload_max_filesize / 1024;

  // const { mutate: createProduct, isLoading: creating } =
  //   useCreateProductMutation();
  // const { mutate: updateProduct, isLoading: updating } =
  //   useUpdateProductMutation();

  const onSubmit = async (values: ProductFormValues) => {
    // console.log('vals areeeee', values);
    // const inputValues = {
    //   language: router.locale,
    //   ...getProductInputValues(values, initialValues, isNewTranslation),
    // };
    try {
      if (!initialValues) {
        if (!values.image) {
          toast.error('Product Image is required');
          return;
        }

        createShopProduct.mutate({
          // cover_image: values.gallery as File,
          image: values.image!,
          description: values.description!,
          name: values.name,
          price: `${values.price}`,
          quantity: `${values.quantity ?? 1}`,
          shop_uid: router.query.shop as string,
        });
      } else {
        const newData = {
          ...values,
          uid: initialValues.uid,
        };
        updateShopProduct.mutate({
          uid: initialValues.uid,
          name: values.name ?? initialValues.name,
          description: values.description ?? initialValues.description!,
          price: values.price ?? initialValues.price!,
          quantity: values.quantity ?? initialValues.quantity!,
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  console.log('inittt', initialValues);
  const createShopProduct = useMutation({
    mutationFn: createShopProductFn,
    onSuccess: async () => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.product.list}`
        : Routes.product.list;
      await Router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_shop_products');
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateShopProduct = useMutation({
    mutationFn: editShopProductFn,
    onSuccess: async () => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.product.list}`
        : Routes.product.list;
      await Router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success('Updated successfully');
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });

  // const productName = watch('name');

  // const autoSuggestionList = useMemo(() => {
  //   return chatbotAutoSuggestion({ name: productName ?? '' });
  // }, [productName]);

  // const handleGenerateDescription = useCallback(() => {
  //   openModal('GENERATE_DESCRIPTION', {
  //     control,
  //     name: productName,
  //     set_value: setValue,
  //     key: 'description',
  //     suggestion: autoSuggestionList as ItemProps[],
  //   });
  // }, [productName]);

  // const slugAutoSuggest = formatSlug(watch('name'));
  // if (Boolean(options?.isProductReview)) {

  //   if (permission) {
  //     if (initialValues?.status !== ProductStatus?.Draft) {
  //       statusList = [
  //         {
  //           label: 'form:input-label-published',
  //           id: 'published',
  //           value: ProductStatus.Publish,
  //         },
  //         {
  //           label: 'form:input-label-approved',
  //           id: 'approved',
  //           value: ProductStatus.Approved,
  //         },
  //         {
  //           label: 'form:input-label-rejected',
  //           id: 'rejected',
  //           value: ProductStatus.Rejected,
  //         },
  //         {
  //           label: 'form:input-label-soft-disabled',
  //           id: 'unpublish',
  //           value: ProductStatus.UnPublish,
  //         },
  //       ];
  //     } else {
  //       statusList = [
  //         {
  //           label: 'form:input-label-draft',
  //           id: 'draft',
  //           value: ProductStatus.Draft,
  //         },
  //       ];
  //     }
  //   } else {
  //     if (
  //       initialValues?.status === ProductStatus.Publish ||
  //       initialValues?.status === ProductStatus.Approved ||
  //       initialValues?.status === ProductStatus.UnPublish
  //     ) {
  //       {
  //         statusList = [
  //           {
  //             label: 'form:input-label-published',
  //             id: 'published',
  //             value: ProductStatus.Publish,
  //           },
  //           {
  //             label: 'form:input-label-unpublish',
  //             id: 'unpublish',
  //             value: ProductStatus.UnPublish,
  //           },
  //         ];
  //       }
  //     }
  //   }
  // } else {
  //   statusList = [
  //     {
  //       label: 'form:input-label-published',
  //       id: 'published',
  //       value: ProductStatus.Publish,
  //     },
  //     {
  //       label: 'form:input-label-draft',
  //       id: 'draft',
  //       value: ProductStatus.Draft,
  //     },
  //   ];
  // }

  const featuredImageInformation = (
    <span>
      {t('form:featured-image-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{5} MB </span>
    </span>
  );

  const galleryImageInformation = (
    <span>
      {t('form:gallery-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{5} MB </span>
    </span>
  );
  // console.log('we haveeee', initialValues);
  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('Product Image')}
              details={featuredImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput
                name="image"
                control={control}
                multiple={false}
                defaultImage={initialValues?.image as string}
                disabled={!!initialValues?.image}
              />
              {/* {errors.image?.message && (
                <p className="my-2 text-xs text-red-500">
                  {t(errors?.image?.message!)}
                </p>
              )} */}
            </Card>
          </div>

          {/* <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:gallery-title')}
              details={galleryImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput
                name="gallery"
                control={control}
                multiple={false}
                disabled={!!initialValues}
              />
            </Card>
          </div> */}

          {/* <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:video-title')}
              details={t('form:video-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
               Video url picker 
              <div>
                {fields.map((item: any, index: number) => (
                  <div
                    className="border-b border-dashed border-border-200 py-5 first:pt-0 last:border-b-0 md:py-8 md:first:pt-0"
                    key={index}
                  >
                    {' '}
                    <div className="mb-3 flex gap-1 text-sm font-semibold leading-none text-body-dark">
                      {`${t('form:input-label-video-embed')} ${index + 1}`}
                      <Tooltip content={t('common:text-video-tooltip')} />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                      <TextArea
                        className="sm:col-span-4"
                        variant="outline"
                        {...register(`video.${index}.url` as const)}
                        defaultValue={item?.url!}
                        // @ts-ignore
                        error={t(errors?.video?.[index]?.url?.message)}
                      />
                      <button
                        onClick={() => {
                          remove(index);
                        }}
                        type="button"
                        className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1"
                      >
                        {t('form:button-label-remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => {
                  append({ url: '' });
                }}
                className="w-full sm:w-auto"
              >
                {t('form:button-label-add-video')}
              </Button>
            </Card>
          </div> */}

          {/* <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:type-and-category')}
              details={t('form:type-and-category-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <ProductGroupInput
                control={control}
                error={t((errors?.type as any)?.message)}
              />
              <ProductCategoryInput control={control} setValue={setValue} />
              {/* <ProductAuthorInput control={control} /> 
              {/* <ProductManufacturerInput control={control} setValue={setValue} />
              <ProductTagInput control={control} setValue={setValue} />
            </Card>
          </div> */}

          <div className="my-5 flex flex-wrap sm:my-8">
            <Description
              title={t('form:item-description')}
              details={`${
                initialValues
                  ? t('form:item-description-edit')
                  : t('form:item-description-add')
              } ${t('form:product-description-help-text')}`}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t('form:input-label-name')}`}
                {...register('name', {
                  required: 'Name is required',
                })}
                error={t(errors.name?.message!)}
                variant="outline"
                className="mb-5"
                defaultValue={initialValues?.name}
                required
              />

              {/* {isSlugEditable ? (
                <div className="relative mb-5">
                  <Input
                    label={`${t('Slug')}`}
                    {...register('slug')}
                    error={t(errors.slug?.message!)}
                    variant="outline"
                    disabled={isSlugDisable}
                  />
                  <button
                    className="absolute top-[27px] right-px z-10 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                    type="button"
                    title={t('common:text-edit')}
                    onClick={() => setIsSlugDisable(false)}
                  >
                    <EditIcon width={14} />
                  </button>
                </div>
              ) : (
                <Input
                  label={`${t('Slug')}`}
                  {...register('slug')}
                  value={slugAutoSuggest}
                  variant="outline"
                  className="mb-5"
                  disabled
                />
              )} */}
              {/* <Input
                label={`${t('form:input-label-unit')}*`}
                {...register('unit')}
                error={t(errors.unit?.message!)}
                variant="outline"
                className="mb-5"
              /> */}
              <div className="relative">
                {/* {options?.useAi && (
                  <OpenAIButton
                    title="Generate Description With AI"
                    onClick={handleGenerateDescription}
                  />
                )} */}
                <TextArea
                  label={t('form:input-label-description')}
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  error={t(errors.description?.message!)}
                  variant="outline"
                  className="mb-5"
                  defaultValue={initialValues?.description}
                  required
                />
              </div>

              {/* <div>
                <Label>{t('form:input-label-status')}</Label>
                {!isEmpty(statusList)
                  ? statusList?.map((status: any, index: number) => (
                      <Radio
                        key={index}
                        {...register('status')}
                        label={t(status?.label)}
                        id={status?.id}
                        value={status?.value}
                        className="mb-2"
                        // disabled={
                        //   permission &&
                        //   initialValues?.status === ProductStatus?.Draft
                        //     ? true
                        //     : false
                        // }
                      />
                    ))
                  : ''}
                {errors.status?.message && (
                  <p className="my-2 text-xs text-red-500">
                    {t(errors?.status?.message!)}
                  </p>
                )}
              </div> */}
            </Card>
          </div>

          {/* <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:form-title-product-type')}
              details={t('form:form-description-product-type')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
            />

						<ProductTypeInput />
					</div> */}

          <ProductSimpleForm
            initialValues={initialValues}
            shopData={shopData}
          />

          {/* Simple Type */}
          {/* {product_type?.value === ProductType.Simple && (
          )} */}

          {/* Variation Type */}
          {/* {product_type?.value === ProductType.Variable && (
            <ProductVariableForm
              shopId={shopId}
              initialValues={initialValues}
              settings={options}
            />
          )} */}

          <StickyFooterPanel>
            <div className="flex items-center">
              {initialValues && (
                <Button
                  variant="outline"
                  onClick={router.back}
                  className="me-4"
                  type="button"
                >
                  {t('form:button-label-back')}
                </Button>
              )}
              <div className="ml-auto">
                {/* {showPreviewButton && (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_SHOP_URL}/products/preview/${router.query.productSlug}`}
                    target="_blank"
                    className="inline-flex h-12 flex-shrink-0 items-center justify-center rounded border !border-accent bg-transparent px-5 py-0 text-sm font-semibold leading-none !text-accent outline-none transition duration-300 ease-in-out me-4 hover:border-accent hover:bg-accent hover:!text-white focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700 md:text-base"
                  >
                    <EyeIcon className="w-4 h-4 me-2" />
                    {t('form:button-label-preview-product-on-shop')}
                  </Link>
                )} */}
                <Button
                  loading={
                    createShopProduct.isLoading || updateShopProduct.isLoading
                  }
                  disabled={
                    createShopProduct.isLoading || updateShopProduct.isLoading
                  }
                  size="medium"
                  className="text-sm md:text-base"
                >
                  {initialValues ? (
                    <>
                      <UpdateIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                      <span className="sm:hidden">
                        {t('form:button-label-update')}
                      </span>
                      <span className="hidden sm:block">
                        {t('form:button-label-update-product')}
                      </span>
                    </>
                  ) : (
                    t('form:button-label-add-product')
                  )}
                </Button>
              </div>
            </div>
          </StickyFooterPanel>
        </form>
      </FormProvider>
    </>
  );
}
