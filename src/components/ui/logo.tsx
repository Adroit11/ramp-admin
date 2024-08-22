import Link from '@/components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@/settings/site.settings';
import { useAtom } from 'jotai';
import { miniSidebarInitialValue } from '@/utils/constants';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const [miniSidebar, _] = useAtom(miniSidebarInitialValue);
  const { width } = useWindowSize();
  return (
    <Link
      href={siteSettings?.logo?.href}
      className={cn('inline-flex items-center gap-3', className)}
      // {...props}
    >
      {miniSidebar && width >= RESPONSIVE_WIDTH ? (
        <span
          className="relative overflow-hidden text-xs tracking-tighter text-center inline-flex items-end justify-center font-semibold text-accent"
          style={{
            width: siteSettings.collapseLogo.width,
            height: siteSettings.collapseLogo.height,
          }}
        >
          <Image
            src={
              // settings?.options?.collapseLogo?.original ??
              siteSettings.collapseLogo.url
            }
            alt={
              // settings?.options?.siteTitle ??
              siteSettings.collapseLogo.alt
            }
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-contain"
            loading="eager"
          />
        </span>
      ) : (
        <span
          className="relative overflow-hidden text-center inline-flex items-end justify-center font-semibold text-accent text-lg "
          style={{
            width: siteSettings.logo.width,
            height: siteSettings.logo.height,
          }}
        >
          <Image
            src={
              // ettings?.options?.logo?.original ??
              siteSettings.logo.url
            }
            alt={
              // settings?.options?.siteTitle ??
              siteSettings.logo.alt
            }
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-contain"
            loading="eager"
          />
        </span>
      )}
    </Link>
  );
};

export default Logo;
