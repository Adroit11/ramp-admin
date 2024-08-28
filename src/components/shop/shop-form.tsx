import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import { EditIcon } from '@/components/icons/edit';
import * as socialIcons from '@/components/icons/social';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import { Config } from '@/config';
import { useSettingsQuery } from '@/data/settings';
import { useCreateShopMutation, useUpdateShopMutation } from '@/data/shop';
import {
  BalanceInput,
  CurrencyType,
  ItemProps,
  ShopSettings,
  ShopSocialInput,
  UserAddressInput,
} from '@/types';
import { getAuthCredentials, isStoreOwner } from '@/utils/auth-utils';
import { STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';
import { getFormattedImage } from '@/utils/get-formatted-image';
import { getIcon } from '@/utils/get-icon';
import { yupResolver } from '@hookform/resolvers/yup';
import { join, split } from 'lodash';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import OpenAIButton from '../openAI/openAI.button';
import { useAtom } from 'jotai';
import { locationAtom } from '@/utils/use-location';
import { useModalAction } from '../ui/modal/modal.context';
import { shopValidationSchema } from './shop-validation-schema';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { socialIcon } from '@/settings/site.settings';
import { ShopDescriptionSuggestion } from '@/components/shop/shop-ai-prompt';
import PhoneNumberInput from '@/components/ui/phone-input';
import { useMutation } from 'react-query';
import {
  CreateShopDataType,
  createShopFn,
  EditShopDataType,
  editShopFn,
} from '@/services/shop';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';
import { getErrorMessage } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import Select from '../ui/select/select';
import { useCurrency } from '@/hooks/useCurrency';

// const socialIcon = [
//   {
//     value: 'FacebookIcon',
//     label: 'Facebook',
//   },
//   {
//     value: 'InstagramIcon',
//     label: 'Instagram',
//   },
//   {
//     value: 'TwitterIcon',
//     label: 'Twitter',
//   },
//   {
//     value: 'YouTubeIcon',
//     label: 'Youtube',
//   },
// ];

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex items-center justify-center w-4 h-4">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type FormValues = {
  name: string;
  description: string;
  cover_image: File | string;
  image: File | string;
  address: UserAddressInput;
  url?: string;
  currency?: string;
};

interface EditShopProps {
  uid: string;
  description: string;
  address: string[];
  url?: string;
  shop_website_link?: string;
  cover_image?: File | string;
  image?: File | string;

  currency?: CurrencyType;
  name?: string;
}

const ShopForm = ({ initialValues }: { initialValues?: EditShopProps }) => {
  const { user } = useAuth();
  // const [location] = useAtom(locationAtom);
  // const { mutate: createShop, isLoading: creating } = useCreateShopMutation();
  // const { mutate: updateShop, isLoading: updating } = useUpdateShopMutation();
  // const { permissions } = getAuthCredentials();
  // let permission = hasAccess(adminAndOwnerOnly, permissions);
  // const { permissions } = getAuthCredentials();

  // console.log('init val', initialValues?.address[0]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    setValue,
    control,
  } = useForm<FormValues>({
    shouldUnregister: true,
    ...(initialValues
      ? {
          defaultValues: {
            ...initialValues,
            image: initialValues.image as string,
            cover_image: initialValues.cover_image as string,
            name: initialValues.name,
            description: initialValues.description,
            url: initialValues.url,
            currency: initialValues.currency?.code,
            address: {
              street_address: initialValues.address[0],
              city: initialValues.address[1],
              state: initialValues.address[2],
              country: initialValues.address[3],
            },
          },
        }
      : {}),
    //@ts-ignore
    // resolver: yupResolver(shopValidationSchema),
  });

  const router = useRouter();

  const { openModal } = useModalAction();
  const { locale } = router;
  const { currencies } = useCurrency();
  // const {
  //   // @ts-ignore
  //   settings: { options },
  // } = useSettingsQuery({
  //   language: locale!,
  // });

  const generateName = watch('name');
  const shopDescriptionSuggestionLists = useMemo(() => {
    return ShopDescriptionSuggestion({ name: generateName ?? '' });
  }, [generateName]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'description',
      suggestion: shopDescriptionSuggestionLists as ItemProps[],
    });
  }, [generateName]);

  const slugAutoSuggest = formatSlug(watch('name'));
  const { t } = useTranslation();
  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: 'settings.socials',
  // });

  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    (router?.query?.action === 'edit' || router?.pathname === '/[shop]/edit') &&
    router?.locale === Config.defaultLanguage;
  function onSubmit(values: FormValues) {
    // console.log('lipppppp', values);

    // const settings = {
    //   ...values?.settings,
    //   location: { ...omit(values?.settings?.location, '__typename') },
    //   socials: values?.settings?.socials
    //     ? values?.settings?.socials?.map((social: any) => ({
    //         icon: social?.icon?.value,
    //         url: social?.url,
    //       }))
    //     : [],
    // };
    if (initialValues) {
      if (!initialValues.url && !values.url) {
        toast.error('URL is required');

        return;
      }

      const data: EditShopDataType = {
        uid: initialValues.uid,
        address: [
          `${values.address.street_address}`,
          `${values.address.city}`,
          `${values.address.state} `,
          `${values.address.country}`,
        ],
        description: values.description,
        url: values.url ?? initialValues.url,
      };

      if (initialValues.currency) {
        data.currency = values.currency ?? initialValues.currency?.code;
      }

      // console.log('data is', data);
      updateShop.mutate(data);
    } else {
      if (
        !values.address ||
        !values.cover_image ||
        !values.description ||
        !values.image ||
        !values.name ||
        !values.url
      ) {
        toast.error('All fields are required');
      }
      const data = {
        ...values,
        url: values.url,
        currency: values.currency,
        cover_image: values.cover_image as File,
        image: values.image as File,
        address: [
          `${values.address.street_address}`,
          `${values.address.city}`,
          `${values.address.state} `,
          `${values.address.country}`,
        ],
      } satisfies CreateShopDataType;

      createShop.mutate(data);
    }
  }

  // console.log('iii', initialValues);

  const createShop = useMutation({
    mutationFn: createShopFn,
    onSuccess: () => {
      toast.success('Shop created successfully');
      if (user?.role === 'super_admin') {
        router.push(Routes.shop.list);
      } else {
        router.push(Routes.dashboard);
      }
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
  const updateShop = useMutation({
    mutationFn: editShopFn,
    onSuccess: () => {
      toast.success('Shop updated successfully');
      if (user?.role === 'super_admin') {
        router.push(Routes.shop.list);
      } else {
        router.push(Routes.dashboard);
      }
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });

  // const isGoogleMapActive = options?.useGoogleMap;

  const coverImageInformation = (
    <span>
      {t('form:shop-cover-image-help-text')} <br />
      {t('form:cover-image-dimension-help-text')} &nbsp;
      <span className="font-bold">1170 x 435{t('common:text-px')}</span>
    </span>
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={t('form:input-label-logo')}
            details={t('form:shop-logo-help-text')}
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
          </Card>
        </div>

        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={t('form:shop-cover-image-title')}
            details={coverImageInformation}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <FileInput
              name="cover_image"
              control={control}
              multiple={false}
              defaultImage={initialValues?.cover_image as string}
              disabled={!!initialValues?.cover_image}
            />
          </Card>
        </div>
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={t('form:shop-basic-info')}
            details={t('form:shop-basic-info-help-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-name')}
              {...register('name', {
                required: 'Name is required',
              })}
              variant="outline"
              className="mb-5"
              error={t(errors.name?.message!)}
              disabled={!!initialValues?.name}
              required
            />

            {/* {isSlugEditable ? (
              <div className="relative mb-5">
                <Input
                  label={t('form:input-label-slug')}
                  {...register('slug')}
                  error={t(errors.slug?.message!)}
                  variant="outline"
                  disabled={isSlugDisable}
                />
                <button
                  className="absolute top-[27px] right-px z-0 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                  type="button"
                  title={t('common:text-edit')}
                  onClick={() => setIsSlugDisable(false)}
                >
                  <EditIcon width={14} />
                </button>
              </div>
            ) : (
              <Input
                label={t('form:input-label-slug')}
                {...register('slug')}
                value={slugAutoSuggest}
                variant="outline"
                className="mb-5"
                disabled
              />
            )} */}

            <div className="relative mb-5">
              {/* {options?.useAi && (
                <OpenAIButton
                  title={t('form:button-label-description-ai')}
                  onClick={handleGenerateDescription}
                />
              )} */}
              <TextArea
                label={t('form:input-label-description')}
                {...register('description', {
                  required: 'Description is required',
                })}
                variant="outline"
                error={t(errors.description?.message!)}
                required
              />
            </div>

            <Input
              label={t('Shop Website URL')}
              {...register('url', {
                required: 'Shop URL is required',
              })}
              variant="outline"
              required
            />

            <div className="my-6">
              <label
                htmlFor={'currency'}
                className="mb-3 block text-sm font-semibold leading-none text-body-dark"
              >
                {t('Shop Currency (defaults to USD)')}
                {/* <span className="ml-0.5 text-red-500">*</span> */}
              </label>
              <Select
                placeholder={
                  initialValues?.currency
                    ? initialValues.currency?.name
                    : 'Pick a currency'
                }
                options={
                  currencies && Array.isArray(currencies)
                    ? currencies.map((x) => ({
                        label: x.name,
                        value: x.code,
                      }))
                    : []
                }
                onChange={(val: any) => {
                  // console.log(val);
                  setValue('currency', val.value as string);
                }}
                defaultValue={
                  initialValues?.currency
                    ? {
                        label: initialValues.currency?.name,
                        value: initialValues.currency?.code,
                      }
                    : undefined
                }
              />
            </div>
          </Card>
        </div>
        {/* <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
          <Description
            title={t('form:shop-payment-info')}
            details={t('form:payment-info-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-account-holder-name')}
              {...register('balance.payment_info.name')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.name?.message!)}
              required
            />
            <Input
              label={t('form:input-label-account-holder-email')}
              {...register('balance.payment_info.email')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.email?.message!)}
              required
            />
            <Input
              label={t('form:input-label-bank-name')}
              {...register('balance.payment_info.bank')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.bank?.message!)}
              required
            />
            <Input
              label={t('form:input-label-account-number')}
              {...register('balance.payment_info.account')}
              variant="outline"
              error={t(errors.balance?.payment_info?.account?.message!)}
              required
            />
          </Card>
        </div> */}
        <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
          <Description
            title={t('form:shop-address')}
            details={t('form:shop-address-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            {/* {isGoogleMapActive && (
              <div className="mb-5">
                <Label>{t('form:input-label-autocomplete')}</Label>
                <Controller
                  control={control}
                  name="settings.location"
                  render={({ field: { onChange, value } }) => (
                    <GooglePlacesAutocomplete
                      // @ts-ignore
                      onChange={(location: any) => {
                        onChange(location);
                        setValue('address.country', location?.country);
                        setValue('address.city', location?.city);
                        setValue('address.state', location?.state);
                        setValue('address.zip', location?.zip);
                        setValue(
                          'address.street_address',
                          location?.street_address,
                        );
                      }}
                      data={getValues('settings.location')!}
                      onChangeCurrentLocation={onChange}
                    />
                  )}
                />
              </div>
            )} */}
            <Input
              label={t('form:input-label-country')}
              {...register('address.country', {
                required: 'Country is required',
              })}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.country?.message!)}
              required
            />

            <Input
              label={t('form:input-label-state')}
              {...register('address.state', {
                required: 'State is required',
              })}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.state?.message!)}
              required
            />
            <Input
              label={t('form:input-label-city')}
              {...register('address.city', {
                required: 'City is required',
              })}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.city?.message!)}
              required
            />
            {/* <Input
              label={t('form:input-label-zip')}
              {...register('address.zip')}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.zip?.message!)}
            /> */}
            <TextArea
              label={t('form:input-label-street-address')}
              {...register('address.street_address', {
                required: 'Address is required',
              })}
              variant="outline"
              error={t(errors.address?.street_address?.message!)}
              required
            />
          </Card>
        </div>

        {/* {isStoreOwner() ? (
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:form-notification-title')}
              details={t('form:form-notification-description')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full mb-5 sm:w-8/12 md:w-2/3">
              <Input
                label={t('form:input-notification-email')}
                {...register('settings.notifications.email')}
                error={t(errors?.settings?.notifications?.email?.message!)}
                variant="outline"
                className="mb-5"
                disabled={permissions?.includes(SUPER_ADMIN)}
                type="email"
              />
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.notifications.enable"
                  control={control}
                  disabled={permissions?.includes(SUPER_ADMIN)}
                />
                <Label className="!mb-0.5">
                  {t('form:input-enable-notification')}
                </Label>
              </div>
            </Card>
          </div>
        ) : (
          ''
        )} */}
        {/* <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
          <Description
            title={t('form:shop-settings')}
            details={t('form:shop-settings-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <PhoneNumberInput
              label={t('form:input-label-contact')}
              required
              {...register('settings.contact')}
              control={control}
              error={t(errors.settings?.contact?.message!)}
            />
            <Input
              label={t('form:input-label-website')}
              {...register('settings.website')}
              variant="outline"
              className="mb-5"
              error={t(errors.settings?.website?.message!)}
              required
            />
          </Card>
        </div> */}

        {/* <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
          <Description
            title={t('form:social-settings')}
            details={t('form:social-settings-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div>
              {fields?.map(
                (item: ShopSocialInput & { id: string }, index: number) => (
                  <div
                    className="py-5 border-b border-dashed border-border-200 first:mt-0 first:border-t-0 first:pt-0 last:border-b-0 md:py-8 md:first:mt-0"
                    key={item.id}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                      <div className="sm:col-span-2">
                        <Label>{t('form:input-label-select-platform')}</Label>
                        <SelectInput
                          name={`settings.socials.${index}.icon` as const}
                          control={control}
                          options={updatedIcons}
                          isClearable={true}
                          defaultValue={item?.icon!}
                        />
                      </div>
              
                      <Input
                        className="sm:col-span-2"
                        label={t('form:input-label-url')}
                        variant="outline"
                        {...register(`settings.socials.${index}.url` as const)}
                        error={t(
                          errors?.settings?.socials?.[index]?.url?.message!,
                        )}
                        defaultValue={item.url!} // make sure to set up defaultValue
                        required
                      />
                      <button
                        onClick={() => {
                          remove(index);
                        }}
                        type="button"
                        className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                      >
                        {t('form:button-label-remove')}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
            <Button
              type="button"
              onClick={() => append({ icon: '', url: '' })}
              className="w-full text-sm sm:w-auto md:text-base"
            >
              {t('form:button-label-add-social')}
            </Button>
          </Card>
        </div> */}

        <StickyFooterPanel className="z-0">
          <div className="mb-5 text-end">
            <Button
              loading={createShop.isLoading || updateShop.isLoading}
              disabled={createShop.isLoading || updateShop.isLoading}
            >
              {initialValues
                ? t('form:button-label-update')
                : t('form:button-label-save')}
            </Button>
          </div>
        </StickyFooterPanel>
      </form>
    </>
  );
};

export default ShopForm;
