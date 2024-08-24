import { useSettings } from '@/contexts/settings.context';
import { DefaultSeo as NextDefaultSeo } from 'next-seo';

const DefaultSeo = () => {
  // const settings = useSettings();
  return (
    <NextDefaultSeo
      title={'Ramp | New Customers, More Sales'}
      titleTemplate={'Ramp | New Customers, More Sales'}
      defaultTitle="Ramp | New Customers, More Sales"
      description={'Ramp | New Customers, More Sales'}
      // canonical={settings?.seo?.canonicalUrl}
      openGraph={{
        title: 'Ramp | New Customers, More Sales',
        description: 'Ramp | New Customers, More Sales',
        type: 'website',
        locale: 'en_US',
        site_name: 'Ramp',
        images: [
          {
            url: 'http://res.cloudinary.com/dc9kfp5gt/image/upload/v1724451002/RampIcon/nk4lnmcd8vhwhet6mvn8.svg',
            width: 497,
            height: 100,
            alt: 'Ramp | New Customers, More Sales',
          },
        ],
      }}
      // twitter={{
      //   handle: settings?.seo?.twitterHandle,
      //   site: settings?.siteTitle,
      //   cardType: settings?.seo?.twitterCardType,
      // }}
      additionalMetaTags={[
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1 maximum-scale=1',
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'theme-color',
          content: '#ffffff',
        },
      ]}
      additionalLinkTags={[
        // {
        //   rel: 'apple-touch-icon',
        //   href: 'icons/apple-icon-180.png',
        // },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
      ]}
    />
  );
};

export default DefaultSeo;
