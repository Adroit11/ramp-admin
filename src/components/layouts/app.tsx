import { getUserAuthData } from '@/utils/auth-utils';
import { SUPER_ADMIN } from '@/utils/constants';
import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@/components/layouts/admin'));
const OwnerLayout = dynamic(() => import('@/components/layouts/owner'));

export default function AppLayout({
  userPermissions,
  ...props
}: {
  userPermissions: string[];
}) {
  const userAuthData = getUserAuthData();
  // console.log('fff', userPermissions, userAuthData);
  if (userAuthData?.role === 'super_admin') {
    return <AdminLayout {...props} />;
  }
  return <OwnerLayout {...props} />;
}
