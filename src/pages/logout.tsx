import { useEffect } from 'react';
import Loader from '@/components/ui/loader/loader';
import { useLogoutMutation } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { clearStorage } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';

function SignOut() {
  const { t } = useTranslation();
  const router = useRouter();
  // const { mutate: logout } = useLogoutMutation();

  useEffect(() => {
    clearStorage();
    router.push(Routes.login);
  }, []);

  return <Loader text={t('common:signing-out-text')} />;
}

export default SignOut;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
