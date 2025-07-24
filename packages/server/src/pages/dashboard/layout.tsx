import Navbar from "@/src/pages/dashboard/Navbar";
import Sidebar from "@/src/pages/dashboard/SidebarDesktop";
import ThemeSwitch from "@/src/lib/components/custom/ThemeSwitch";
// import { useMouseGlow } from "../lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  // const mousePosition = useMouseGlow();
  return (
    <div className="bg-background [--navbar-height:5rem] [--sidebar-width:0px] lg:[--sidebar-width:16rem]">
      <div className="h-[var(--navbar-height)]">
        <Navbar />
      </div>

      <Sidebar />

      <div className="lg:ml-[var(--sidebar-width)] h-[calc(100dvh-var(--navbar-height))] @container/main px-4">
        {children}
      </div>

      <div className="fixed right-4 bottom-4">
        <ThemeSwitch />
      </div>
    </div>
  );
}