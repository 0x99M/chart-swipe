"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUsersCollection } from "@/utils/mongodb";

export async function login(formData: FormData) {
  const email = (formData.get("signin-email") as string)?.trim();
  // Password is ignored for simplicity per request. In real apps, hash and verify.
  const _password = (formData.get("signin-password") as string) ?? "";

  if (!email) redirect("/error");

  const users = await getUsersCollection();
  const existing = await users.findOne({ email });

  if (existing) {
    const jar = await cookies();
    jar.set("user_id", existing._id.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    const insert = await users.insertOne({ email, watchlist: [], nextId: 1 } as any);
    const jar = await cookies();
    jar.set("user_id", insert.insertedId.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const jar = await cookies();
  jar.set("user_id", "", { path: "/", httpOnly: true, maxAge: 0 });

  revalidatePath('/', 'layout');
  redirect('/login');
}
