import Image from 'next/image';
// import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
// import Badge from '@/components/ui/badge/badge';
import { Shop, UserAddress } from '@/types';
import classNames from 'classnames';
import { formatAddress } from '@/utils/format-address';
import { useFormatPhoneNumber } from '@/utils/format-phone-number';
import { MapPinIcon } from '@/components/icons/map-pin';
import { isNumber } from 'lodash';
import ShopAvatar from '@/components/shop/shop-avatar';
import { PhoneOutlineIcon } from '@/components/icons/phone';
// import { useShopQuery } from '@/data/shop';
import { useTranslation } from 'next-i18next';

type ShopCardProps = {
  shop: Shop;
};

export const ListItem = ({ title, info }: { title: string; info: number }) => {
  return (
    <>
      {isNumber(info) ? (
        <p className="text-sm font-semibold text-muted-black">{Number(info)}</p>
      ) : (
        ''
      )}
      {title ? <p className="text-xs text-[#666]">{title}</p> : ''}
    </>
  );
};

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const { t } = useTranslation();

  // const isNew = false;

  const phoneNumber = useFormatPhoneNumber({
    customer_contact: shop?.settings?.contact as string,
  });

  return (
    <Link
      href={`/${shop?.uid}`}
      className="overflow-hidden rounded-lg bg-white border-2 hover:border-accent transition duration-300"
    >
      <div
        className={classNames(
          'relative flex h-22 justify-end overflow-hidden',
          // shop?.cover_image?.original ? '' : 'flex justify-end'
        )}
      >
        <Image
          alt={shop?.name as string}
          // src={shop?.cover_image?.original ?? '/topographic.svg'}
          src={'/topographic.svg'}
          // fill
          width={350}
          height={88}
          sizes="(max-width: 768px) 100vw"
          // className={classNames(
          //   shop?.cover_image?.original
          //     ? 'h-full w-full object-cover'
          //     : 'h-auto w-auto object-contain'
          // )}
          className="h-auto w-auto object-contain"
        />
      </div>
      <div className="relative z-10 -mt-[4.25rem] ml-6 flex flex-wrap items-center gap-3">
        <ShopAvatar
          is_active={shop?.is_active}
          name={shop?.name}
          // @ts-ignore
          logo={shop?.logo ?? ''}
        />
        <div className="relative max-w-[calc(100%-104px)] flex-auto pr-4 pt-2">
          {shop?.name ? (
            <h3 className="text-base font-medium leading-none text-muted-black">
              {shop?.name}
            </h3>
          ) : (
            ''
          )}

          <div className="mt-2 flex w-11/12 items-center gap-1 text-xs leading-none">
            <MapPinIcon className="shrink-0 text-[#666666]" />
            <p className="truncate text-base-dark">
              {formatAddress(shop?.address as UserAddress)
                ? formatAddress(shop?.address as UserAddress)
                : '???'}
            </p>
          </div>

          {/* <div className="mt-2 flex w-11/12 items-center gap-1 text-xs leading-none">
            <PhoneOutlineIcon className="shrink-0 text-[#666666]" />
            <p className="truncate text-xs text-base-dark">
              {phoneNumber ?? '???'}
            </p>
          </div> */}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 divide-x divide-[#E7E7E7] px-2 pb-7 text-center">
        <li>
          <ListItem
            // title={t('text-title-commission')}
            title={t('Products')}
            info={shop?.no_of_products ?? (0 as number)}
          />
        </li>
        <li>
          <ListItem
            // title={t('text-title-sale')}
            title={t('Orders')}
            info={shop?.no_of_orders ?? (0 as number)}
          />
        </li>
        {/* <li>
          <ListItem
            title={t('text-title-balance')}
            info={shop?.balance?.current_balance ?? (0 as number)}
          />
        </li>
        <li>
          <ListItem
            title={t('text-title-withdraw')}
            info={shop?.balance?.withdrawn_amount ?? (0 as number)}
          />
        </li> */}
      </ul>
    </Link>
  );
};

export default ShopCard;
