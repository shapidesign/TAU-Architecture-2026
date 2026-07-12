import { isAdmin } from "@/lib/auth";
import { getFaculty, getGraduates, getSettings } from "@/lib/data";
import AdminDashboard from "./ui/AdminDashboard";
import LoginForm from "./ui/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "ניהול · Admin", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const [settings, graduates, faculty] = await Promise.all([
    getSettings(),
    getGraduates(),
    getFaculty(),
  ]);

  return (
    <AdminDashboard settings={settings} graduates={graduates} faculty={faculty} />
  );
}
