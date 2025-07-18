import Navbar from "@/src/lib/components/app/Navbar";
import Sidebar from "@/src/lib/components/app/Sidebar";
import ThemeSwitch from "@/src/lib/components/custom/ThemeSwitch";
// import { useMouseGlow } from "../lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  // const mousePosition = useMouseGlow();
  return (
    <div className="bg-background [--navbar-height:5rem] md:[--sidebar-width:12rem]">
      {/* <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 60%)`,
        }}
      /> */}
      <div className="h-[var(--navbar-height)] border-b-4 border-black">
        <Navbar />
      </div>

      <Sidebar />

      <div className="ml-[var(--sidebar-width)] h-[calc(100dvh-var(--navbar-height))] @container/main">
        {children}
      </div>

      <div className="fixed right-4 bottom-4">
        <ThemeSwitch />
      </div>
    </div>
  );
}