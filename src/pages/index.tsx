import dynamic from 'next/dynamic';
import { getUserAuthData } from '@/utils/auth-utils';
import AppLayout from '@/components/layouts/app';
import { GetServerSideProps } from 'next';
import { Routes } from '@/config/routes';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { UserAuthType } from '@/types/auth';

const AdminDashboard = dynamic(() => import('@/components/dashboard/admin'), {
  ssr: false,
});
const OwnerDashboard = dynamic(() => import('@/components/dashboard/owner'), {
  ssr: false,
});

export default function Dashboard({
  userAuthData,
}: {
  userAuthData: UserAuthType;
}) {
  if (userAuthData?.role === 'super_admin') {
    return <AdminDashboard />;
  }
  return <OwnerDashboard />;
}

Dashboard.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  // TODO: Improve it
  const generateRedirectUrl = Routes.login;
  // const generateRedirectUrl =
  //   locale !== Config.defaultLanguage
  //     ? `/${locale}${Routes.login}`
  //     : Routes.login;
  // const { token, permissions } = getAuthCredentials(ctx);
  // if (
  //   !isAuthenticated({ token, permissions }) ||
  //   !hasAccess(allowedRoles, permissions)
  // ) {

  if (!getUserAuthData(ctx)) {
    return {
      redirect: {
        destination: generateRedirectUrl,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations('en', [
          'common',
          'form',
          'table',
          'widgets',
        ])),
        userPermissions: [],
        userAuthData: getUserAuthData(ctx),
      },
    };
  }
  return {
    props: {
      userPermissions: getUserAuthData(ctx) ? [getUserAuthData(ctx)?.role] : [],
      userAuthData: getUserAuthData(ctx),
    },
  };
};
