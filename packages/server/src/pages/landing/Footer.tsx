import { Button } from "@/src/lib/components/ui/button";
import { Shield, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 py-20 lg:py-24 backdrop-blur-sm relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6 lg:mb-8">
              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="font-bold text-xl lg:text-2xl text-white tracking-tight">
                Haithe
              </span>
            </div>
            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
              Building trust in AI through decentralized verification
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                "Marketplace",
                "Documentation",
                "API Reference",
                "Testnet",
              ],
            },
            {
              title: "Community",
              links: ["Discord", "Twitter", "GitHub", "Blog"],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Privacy", "Terms"],
            },
          ].map((section, index) => (
            <div key={index}>
              <h4 className="font-bold mb-4 lg:mb-6 text-white text-base lg:text-lg">{section.title}</h4>
              <ul className="space-y-2 lg:space-y-3 text-white/60 text-sm lg:text-base">
                {section.links.map((link, linkIndex) => (
                  <li
                    key={linkIndex}
                    className="hover:text-white transition-colors cursor-pointer duration-300"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-12 lg:mt-16 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <p className="text-white/60 text-sm lg:text-base">© 2024 Haithe. All rights reserved.</p>
          <div className="flex space-x-2">
            {[Github, Twitter, MessageCircle].map((Icon, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-110 p-2 lg:p-3"
              >
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
