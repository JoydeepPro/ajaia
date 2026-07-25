import { cookies } from "next/headers";

export async function requireUser() {
  await cookies();
  return { id: "local-user-id", email: "local@example.com" };
}
