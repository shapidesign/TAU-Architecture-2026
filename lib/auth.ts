import { createHmac } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "tau_admin";

function token(): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev-secret")
    .update("tau-admin-v1")
    .digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  return (await cookies()).get(COOKIE)?.value === token();
}

export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function loginWithCredentials(user: string, pass: string): Promise<boolean> {
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    (await cookies()).set(COOKIE, token(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
