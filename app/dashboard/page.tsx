import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { requireUser } from "@/lib/auth";
export default async function Page(){
  const user=await requireUser(); if(!user?.email) redirect("/");
  return <Dashboard userId={user.id} email={user.email}/>;
}
