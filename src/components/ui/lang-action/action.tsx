import ActionButtons from '@/components/common/action-buttons';
import { Config } from '@/config';
import LanguageAction from './language-switcher';
import shop from '@/components/layouts/shop';
import { useRouter } from 'next/router';

export type LanguageSwitcherProps = {
  record: any;
  slug: string;
  deleteModalView?: string | any;
  routes: any;
  className?: string | undefined;
  enablePreviewMode?: boolean;
  isShop?: boolean;
  shopSlug?: string;
  approveProduct?: boolean;
  approveProductIsActive?: boolean;
};

export default function LanguageSwitcher({
  record,
  slug,
  deleteModalView,
  routes,
  className,
  enablePreviewMode,
  isShop,
  shopSlug,
  approveProduct,
  approveProductIsActive,
}: LanguageSwitcherProps) {
  const { enableMultiLang } = Config;
  const {
    query: { shop },
  } = useRouter();

  const preview = `${process.env.NEXT_PUBLIC_SHOP_URL}/products/preview/${slug}`;

  return (
    <>
      {enableMultiLang ? (
        <LanguageAction
          slug={slug}
          record={record}
          deleteModalView={deleteModalView}
          routes={routes}
          className={className}
          enablePreviewMode={enablePreviewMode}
          isShop={isShop}
          shopSlug={shopSlug}
        />
      ) : (
        <ActionButtons
          id={record?.uid}
          editUrl={routes.editWithoutLang(slug, shop)}
          previewUrl={preview}
          enablePreviewMode={false}
          deleteModalView={deleteModalView}
          approveProduct={approveProduct}
          isProductActive={approveProductIsActive}
        />
      )}
    </>
  );
}
