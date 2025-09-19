import { cookies } from "next/headers";

export async function getUserId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("user_id")?.value;
}
