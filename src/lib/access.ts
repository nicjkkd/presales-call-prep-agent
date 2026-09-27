import { cookies } from "next/headers";

export const ACCESS_COOKIE = "access-key";

export async function hasAccess(): Promise<boolean> {
  const cookie = (await cookies()).get(ACCESS_COOKIE)?.value;
  const key = process.env.ACCESS_KEY;
  return Boolean(key) && cookie === key;
}
