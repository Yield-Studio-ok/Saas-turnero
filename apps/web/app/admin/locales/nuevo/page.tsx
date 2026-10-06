import { redirect } from "next/navigation";

export default function NuevoLocalPage() {
  redirect("/admin?tab=locales");
}
