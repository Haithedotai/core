import MarketplaceSidebar from "./MarketplaceSidebar";
import MarketplaceNavbar from "./MarketplaceNavbar";
import ThemeSwitch from "../../../lib/components/custom/ThemeSwitch";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background [--navbar-height:5rem] [--sidebar-width:0px] lg:[--sidebar-width:16rem] @container">
      
      {/* Fixed navbar */}
      <div className="z-40 fixed top-0 left-0 right-0 w-full">
        <MarketplaceNavbar />
      </div>

      <MarketplaceSidebar />

      <div className="min-h-screen @container/main pt-[var(--navbar-height)] ml-0 lg:ml-[var(--sidebar-width)]">
        {children}
      </div>

      <div className="fixed right-4 bottom-4 z-50">
        <ThemeSwitch />
      </div>
    </div>
  );
} 