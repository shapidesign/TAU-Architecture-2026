import { isAdmin } from "@/lib/auth";
import { getGraduates, getSettings } from "@/lib/data";
import AdminDashboard from "./ui/AdminDashboard";
import LoginForm from "./ui/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "ניהול · Admin", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const [settings, graduates] = await Promise.all([getSettings(), getGraduates()]);

  return <AdminDashboard settings={settings} graduates={graduates} />;
}
