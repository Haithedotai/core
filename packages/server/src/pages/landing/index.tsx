import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import type { icons } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Link } from "@tanstack/react-router";
import Icon from "@/src/lib/components/custom/Icon";
import NightSky from "./NightSky";

import { motion } from "framer-motion";
import { FloatingNFTBanner } from "./FloatingNFTBanner";

type IconName = keyof typeof icons;

export default function Landing() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  const addToRefs = useCallback((el: HTMLElement | null, index: number) => {
    sectionsRef.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative w-full">
      <NightSky />
      <Navbar />
      <section className="relative pt-36 lg:pt-50">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute top-0 left-0 w-full object-cover h-full opacity-30"
            autoPlay
            muted
            loop
            playsInline
            src="/static/haitheAI.mp4"
          >
            <source src="/static/haitheAI.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm mb-8 lg:mb-12 backdrop-blur-sm hover:bg-white/8 transition-all duration-200">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse hidden md:block" />
              <span className="text-white/80 font-medium">
                Powered by Hyperion Testnet & Alith AI Framework
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl 2xl:text-8xl tracking-tighter mb-6 lg:mb-8 leading-none">
              Build, Deploy & Monetize <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                AI Agents on Blockchain
              </span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center px-4">
              <Button
                asChild
                size="lg"
                className="text-base lg:text-lg bg-white/90 text-black hover:bg-white border-0 px-8 lg:px-10 py-4 h-auto font-semibold transition-all duration-100 w-full sm:w-auto"
              >
                <Link to="/docs" search={{ doc: undefined, section: undefined }} className="flex items-center">
                  <Icon name="Book" className="ml-1 h-5 w-5" />
                  <span>See Documentation</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base lg:text-lg bg-black border-white/20 text-white/80 hover:bg-white/5 hover:text-white px-8 lg:px-10 py-4 h-auto w-full sm:w-auto"
              >
                <a href="https://www.youtube.com/watch?v=2HCJYMXJGDk" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <Icon name="Play" className="mr-1 h-5 w-5" />
                  Watch Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Images Section - Updated */}
      <section
        ref={(el) => addToRefs(el, 0)}
        className="pt-16 lg:pt-20 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mx-auto">
            {[
              {
                src: "/static/aiAbstract.webp",
                title: "Build custom agents",
                description: "Create, configure, and deploy AI agents with custom context, tools, and knowledge bases"
              },
              {
                src: "/static/transparentAbstract.webp",
                title: "Powered by Blockchain",
                description: "Haithe is built on Hyperion, one of the fastest growing and secure Ethereum Layer-2 networks, built for AI"
              },
              {
                src: "/static/verificationAbstract.webp",
                title: "Sell on the marketplace",
                description: "Buy & sell context, knowledge bases, tools and RPCs"
              }
            ].map((item) => (
              <div key={item.title} className="relative rounded-2xl border border-white/10 overflow-hidden ">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-2xl bg-background border" />
                <div className="relative aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative p-6">
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview Section - Updated */}
      <section
        id="overview"
        ref={(el) => addToRefs(el, 1)}
        className="pt-20 lg:pt-24 relative opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto">
            <div className="flex flex-col items-center text-center mb-16 lg:mb-20">
              <div className="flex relative">
                <motion.img
                  src="/static/metis.svg"
                  alt="Haithe AI"
                  title="Metis L2"
                  className="size-20 object-cover rounded-full bg-secondary p-1 relative z-40 border-2 border-white/20 shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.2, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                />
                <motion.img
                  src="/static/alith.webp"
                  alt="Haithe AI"
                  title="Alith"
                  className="size-20 object-cover rounded-full bg-secondary p-1 relative -ml-6 z-30 border-2 border-white/20 shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.2, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
                <motion.img
                  src="/static/lazai.webp"
                  alt="Haithe AI"
                  title="Lazai"
                  className="size-20 object-cover rounded-full bg-secondary p-1 relative -ml-6 z-20 border-2 border-white/20 shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.2, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
                <motion.img
                  src="/static/hyp-3.webp"
                  alt="Haithe AI"
                  title="Hyperion"
                  className="size-20 object-cover rounded-full bg-secondary p-1 relative -ml-6 z-10 border-2 border-white/20 shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.2, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
              </div>

              <h2 className="text-4xl mt-8 relative sm:text-5xl lg:text-6xl mb-4 w-fit self-center text-white tracking-tight">
                Powered by Hyperion & Alith
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                Everything you need to build, deploy, and monetize AI applications in a decentralized ecosystem
              </p>
            </div>

            <Card className="relative p-8 lg:p-12 border border-white/10 backdrop-blur-sm rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-background/[0.05] to-secondary/[0.02] rounded-3xl" />
              <CardContent className="relative p-0">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  <div className="space-y-6 lg:space-y-8">
                    <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      Complete AI Development Stack
                    </h3>
                    <div className="space-y-4 lg:space-y-6 text-white/70 text-base lg:text-lg leading-relaxed">
                      <p>
                        Haithe provides a full-stack solution for AI development, from agent creation and model orchestration to marketplace commerce and team collaboration.
                      </p>
                      <p>
                        Built on blockchain technology, Haithe ensures transparency, security, and decentralized control while providing the tools needed for modern AI applications.
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-500/5 rounded-2xl p-6 lg:p-8 border border-blue-500/20 backdrop-blur-sm">
                    <h4 className="font-bold text-blue-400 mb-4 lg:mb-6 text-lg lg:text-xl">
                      Platform Features:
                    </h4>
                    <ul className="space-y-3 lg:space-y-4 text-white/70 text-sm lg:text-base">
                      {[
                        "AI Agent Management & Deployment",
                        "Decentralized Marketplace",
                        "Multi-tenant Organizations",
                        "Telegram & Discord Bot Integration",
                        "API Access & Integration",
                      ].map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 lg:mr-4 mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - Updated */}
      <section
        id="how-it-works"
        ref={(el) => addToRefs(el, 3)}
        className="pt-20 lg:pt-24 relative opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl  mb-4 text-white tracking-tight">
                How Haithe Works
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                A complete workflow from development to deployment and monetization
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  iconName: "Network" as IconName,
                  title: "Connect & Create",
                  description: "Connect your Web3 wallet, create an organization, and start building AI agents with custom capabilities and configurations.",
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  iconColor: "text-blue-400"
                },
                {
                  iconName: "Rocket" as IconName,
                  title: "Deploy & Configure",
                  description: "Deploy your AI agents, configure models, enable marketplace products, and set up team collaboration with role-based access.",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  iconColor: "text-purple-400"
                },
                {
                  iconName: "TrendingUp" as IconName,
                  title: "Monetize & Scale",
                  description: "Publish products to the marketplace, earn USDT from usage, and scale your AI applications across the decentralized ecosystem.",
                  gradient: "from-green-500/20 to-emerald-500/20",
                  iconColor: "text-green-400"
                }
              ].map((step) => (
                <Card key={step.title} className="relative p-6 lg:p-8 border border-white/10 backdrop-blur-sm rounded-2xl h-full group hover:border-white/20 transition-all duration-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/[0.05] to-secondary/[0.02] rounded-2xl" />
                  <div className="relative flex items-center space-x-4 mb-6">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 ${step.iconColor} flex items-center justify-center backdrop-blur-sm transition-all duration-200`}>
                      <Icon name={step.iconName} className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="relative text-white/70 text-base leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Updated */}
      <section
        id="features"
        ref={(el) => addToRefs(el, 4)}
        className="pt-20 lg:pt-24 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl  mb-4 text-white tracking-tight">
              Platform Features
            </h2>
            <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
              Everything you need for AI development and deployment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                iconName: "Cpu" as IconName,
                title: "AI Agent Management",
                description: "Create, configure, and deploy AI agents with custom capabilities and settings",
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-400"
              },
              {
                iconName: "Network" as IconName,
                title: "Web3 Integration",
                description: "Blockchain-based authentication, payments, and decentralized marketplace",
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400"
              },
              {
                iconName: "Building2" as IconName,
                title: "Organization Management",
                description: "Multi-tenant workspace with role-based access control and team collaboration",
                gradient: "from-orange-500/20 to-red-500/20",
                iconColor: "text-orange-400"
              },
              {
                iconName: "Store" as IconName,
                title: "Marketplace Ecosystem",
                description: "Buy, sell, and share AI products including knowledge bases, tools, and prompt sets",
                gradient: "from-green-500/20 to-emerald-500/20",
                iconColor: "text-green-400"
              },
              {
                iconName: "MessageSquare" as IconName,
                title: "Real-time Chat",
                description: "Interactive AI conversations with configurable models and marketplace products",
                gradient: "from-indigo-500/20 to-blue-500/20",
                iconColor: "text-indigo-400"
              },
              {
                iconName: "Lock" as IconName,
                title: "Security & Privacy",
                description: "Enterprise-grade security with decentralized access control and data protection",
                gradient: "from-red-500/20 to-pink-500/20",
                iconColor: "text-red-400"
              },
            ].map((feature) => (
              <Card key={feature.title} className="relative border border-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 h-full group hover:border-white/20 transition-all duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-background/[0.05] to-secondary/[0.02] rounded-2xl" />
                <CardHeader className="relative p-0 pb-4">
                  <div className={`${feature.iconColor} mb-4 transition-all duration-200`}>
                    <Icon name={feature.iconName} className="h-8 w-8 lg:h-10 lg:w-10" />
                  </div>
                  <CardTitle className="text-lg lg:text-xl text-white font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-0">
                  <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section - Updated */}
      <section
        id="community"
        ref={(el) => addToRefs(el, 5)}
        className="pt-20 lg:pt-24 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl  mb-4 text-white tracking-tight">
              Join the Haithe Ecosystem
            </h2>
            <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
              Whether you're building AI applications, creating marketplace products, or integrating AI into your projects
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {[
              {
                iconName: "Palette" as IconName,
                title: "Creators",
                description: "Developers and creators who build AI products, tools, and knowledge bases for the marketplace.",
                buttonText: "Start Building",
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-400"
              },
              {
                iconName: "Code" as IconName,
                title: "Developers",
                description: "Create organizations and build AI agents by leveraging marketplace products and tools.",
                buttonText: "Create Organization",
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400"
              },
              {
                iconName: "Eye" as IconName,
                title: "Auditors",
                description: "Verify the integrity and quality of data and products provided by creators in the ecosystem.",
                buttonText: "Join as Validator",
                gradient: "from-green-500/20 to-emerald-500/20",
                iconColor: "text-green-400"
              },
            ].map((community) => (
              <Card key={community.title} className="relative p-6 lg:p-8 text-center border border-white/10 backdrop-blur-sm rounded-2xl h-full group hover:border-white/20 transition-all duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-background/[0.05] to-secondary/[0.02] rounded-2xl" />
                <div className={`relative h-14 w-14 lg:h-16 lg:w-16 mx-auto mb-4 lg:mb-6 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all duration-200`}>
                  <Icon name={community.iconName} className={`h-7 w-7 lg:h-8 lg:w-8 ${community.iconColor}`} />
                </div>
                <h3 className="relative text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-white">
                  {community.title}
                </h3>
                <p className="relative text-white/60 mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">
                  {community.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-20">
        <Footer />
      </section>
      <FloatingNFTBanner />
    </div>
  );
}
