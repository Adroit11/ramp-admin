export const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? '';

export function getErrorMessage(err: any): string {
  const msg =
    // err?.response?.data?.errors?.email[0] ||
    // err?.response?.data?.errors?.phonenumber[0] ||
    err?.response?.data?.message?.message ||
    err?.response?.data?.message ||
    err?.response?.message ||
    err?.message ||
    'Something went wrong';

  if (msg.length > 150) {
    return msg.split('').slice(0, 50).join('');
  }

  return msg;
}

export function convertShopAddres(
  obj?: Record<string, string> | string[] | null | undefined,
): string {
  if (!obj) return '';

  if (Array.isArray(obj)) {
    return obj.join(', ');
  }

  return Object.values(obj)?.join(', ');
}
