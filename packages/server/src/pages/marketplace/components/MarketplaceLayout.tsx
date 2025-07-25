import MarketplaceSidebar from "./MarketplaceSidebar";
import ThemeSwitch from "../../../lib/components/custom/ThemeSwitch";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background [--navbar-height:5rem] [--sidebar-width:0px] lg:[--sidebar-width:16rem] @container">
      
      <MarketplaceSidebar />

      <div className="min-h-screen @container/main">
        {children}
      </div>

      <div className="fixed right-4 bottom-4 z-50">
        <ThemeSwitch />
      </div>
    </div>
  );
} 