import { Button } from "@/src/lib/components/ui/button";
import { Shield, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 py-16 backdrop-blur-sm relative z-20">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">
                Haithe
              </span>
            </div>
            <p className="text-white/60 leading-relaxed">
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
              <h4 className="font-bold mb-6 text-white">{section.title}</h4>
              <ul className="space-y-3 text-white/60">
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
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60">© 2024 Haithe. All rights reserved.</p>
          <div className="flex space-x-2 mt-6 md:mt-0">
            {[Github, Twitter, MessageCircle].map((Icon, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-110"
              >
                <Icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
