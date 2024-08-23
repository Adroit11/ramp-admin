import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import Form from '@/components/ui/forms/form';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import Router, { useRouter } from 'next/router';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
  setUserAuthData,
} from '@/utils/auth-utils';
import { useMutation } from 'react-query';
import { loginFn } from '@/services/auth';
import { UserAuthType } from '@/types/auth';
import { getErrorMessage } from '@/utils/helpers';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
});
// const defaultValues = {
//   email: 'admin@demo.com',
//   password: 'demodemo',
// };

const LoginForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const { mutate: login, isLoading, error } = useLogin();

  // function onSubmit({ email, password }: LoginInput) {
  //   login(
  //     {
  //       email,
  //       password,
  //     },
  //     {
  //       onSuccess: (data) => {
  //         if (data?.token) {
  //           if (hasAccess(allowedRoles, data?.permissions)) {
  //             setAuthCredentials(data?.token, data?.permissions, data?.role);
  //             Router.push(Routes.dashboard);
  //             return;
  //           }
  //           setErrorMessage('form:error-enough-permission');
  //         } else {
  //           setErrorMessage('form:error-credential-wrong');
  //         }
  //       },
  //       onError: () => {},
  //     },
  //   );
  // }

  const handleLogin = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      // console.log('for login', data);
      const userData = data?.data as UserAuthType;

      if (userData) {
        setUserAuthData(userData);
        router.push(Routes.dashboard);
      }
    },
    onError: (err) => {
      setErrorMessage(getErrorMessage(err));
    },
  });

  function onSubmit({ email, password }: LoginInput) {
    handleLogin.mutate({ email, password });
  }

  return (
    <>
      <Form<LoginInput>
        validationSchema={loginFormSchema}
        onSubmit={onSubmit}
        // useFormProps={{ defaultValues }}
      >
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('form:input-label-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-4"
              error={t(errors?.email?.message!)}
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              className="mb-4"
              forgotPageLink={Routes.forgotPassword}
            />
            <Button
              className="w-full"
              loading={handleLogin.isLoading}
              disabled={handleLogin.isLoading}
            >
              {t('form:button-label-login')}
            </Button>

            <div className="relative mt-8 mb-6 flex flex-col items-center justify-center text-sm text-heading sm:mt-11 sm:mb-8">
              <hr className="w-full" />
              <span className="absolute -top-2.5 bg-light px-2 -ms-4 start-2/4">
                {t('common:text-or')}
              </span>
            </div>

            <div className="text-center text-sm text-body sm:text-base">
              {t('form:text-no-account')}{' '}
              <Link
                href={Routes.register}
                className="font-semibold text-accent underline transition-colors duration-200 ms-1 hover:text-accent-hover hover:no-underline focus:text-accent-700 focus:no-underline focus:outline-none"
              >
                {t('form:link-register-shop-owner')}
              </Link>
            </div>
          </>
        )}
      </Form>
      {errorMessage ? (
        <Alert
          message={t(errorMessage)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
    </>
  );
};

export default LoginForm;

{
  /* {errorMsg ? (
          <Alert
            message={t(errorMsg)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMsg('')}
          />
        ) : null} */
}
