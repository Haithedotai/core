import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import {
  ArrowRight,
  Shield,
  Users,
  Code,
  Database,
  Zap,
  CheckCircle,
  Star,
  Play,
} from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

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
      <Navbar />
      <section className="relative pt-36 lg:pt-50">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute top-0 left-0 w-full h-full opacity-30"
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
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm mb-8 lg:mb-12 backdrop-blur-sm hover:bg-white/8 transition-all duration-300">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse" />
              <span className="text-white/80 font-medium">
                Decentralized Protocol for Verifiable AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl tracking-tighter mb-6 lg:mb-8 leading-none">
              Building Trust in AI, <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                One Verified Claim at a Time
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/60 mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Haithe creates a transparent, verifiable ecosystem for AI that
              moves beyond simple integrity checks to substantive verification
              through expert auditors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center px-4">
              <Button
                size="lg"
                className="text-base lg:text-lg bg-white text-black hover:bg-white/90 border-0 px-8 lg:px-10 py-4 h-auto font-semibold transition-all duration-100 hover:scale-102 hover:shadow-2xl hover:shadow-white/20 w-full sm:w-auto"
              >
                Explore the Ecosystem
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base lg:text-lg bg-black border-white/20 text-white/80 hover:bg-white/5 hover:text-white px-8 lg:px-10 py-4 h-auto backdrop-blur-sm transition-all duration-100 hover:scale-102 hover:border-white/30 w-full sm:w-auto"
              >
                <Play className="mr-1 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Images Section - Simplified */}
      <section
        ref={(el) => addToRefs(el, 0)}
        className="pt-16 lg:pt-20 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                src: "/static/aiAbstract.webp",
                title: "AI Infrastructure",
                description: "Building the foundation for trusted AI systems"
              },
              {
                src: "/static/transparentAbstract.webp",
                title: "Transparency",
                description: "Clear insights into AI training and capabilities"
              },
              {
                src: "/static/verificationAbstract.webp",
                title: "Verification Process",
                description: "Expert auditors ensuring quality and trust"
              }
            ].map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-70"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section - Simplified */}
      <section
        id="problem"
        ref={(el) => addToRefs(el, 1)}
        className="pt-20 lg:pt-24 relative opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight">
                The Trust Vacuum
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                The core challenge for AI in Web3 isn't just proving that data
                hasn't been tampered with
              </p>
            </div>

            <Card className="p-8 lg:p-12 bg-black/50 border border-white/10 backdrop-blur-sm rounded-3xl">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  <div className="space-y-6 lg:space-y-8">
                    <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      The Semantic Gap
                    </h3>
                    <div className="space-y-4 lg:space-y-6 text-white/70 text-base lg:text-lg leading-relaxed">
                      <p>
                        A cryptographic hash can guarantee a dataset's
                        integrity, but it cannot verify its origin, quality,
                        or content. A creator could claim their AI is trained
                        on financial data when it was actually trained on
                        irrelevant information, and the hash would still be
                        valid.
                      </p>
                      <p>
                        This creates a trust vacuum, preventing developers
                        from confidently building high-stakes applications
                        that rely on third-party AI agents.
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-500/5 rounded-2xl p-6 lg:p-8 border border-red-500/20 backdrop-blur-sm">
                    <h4 className="font-bold text-red-400 mb-4 lg:mb-6 text-lg lg:text-xl">
                      Current Issues:
                    </h4>
                    <ul className="space-y-3 lg:space-y-4 text-white/70 text-sm lg:text-base">
                      {[
                        "No verification of data origin",
                        "Quality claims cannot be validated",
                        "Content misrepresentation is undetectable",
                        "Trust relies on creator reputation alone",
                      ].map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3 lg:mr-4 mt-2 flex-shrink-0" />
                          {issue}
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

      {/* How It Works Section - Simplified */}
      <section
        id="how-it-works"
        ref={(el) => addToRefs(el, 3)}
        className="pt-20 lg:pt-24 relative opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight">
                How Haithe Works
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                A three-part ecosystem with checks and balances between all
                participants
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  number: "1",
                  title: "Creators Submit Claims",
                  description: "Build AI agents and submit detailed claim manifests about training data, including source, date range, and content specifications."
                },
                {
                  number: "2",
                  title: "Auditors Verify",
                  description: "Domain experts stake tokens and investigate claims through secure dataset access, publishing detailed verification reports."
                },
                {
                  number: "3",
                  title: "Consumers Integrate",
                  description: "Browse verified agents, review audit reports, and integrate with confidence knowing exactly what you're getting."
                }
              ].map((step, index) => (
                <Card key={index} className="p-6 lg:p-8 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white flex items-center justify-center text-lg font-black backdrop-blur-sm">
                      {step.number}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-white/70 text-base leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section
        id="features"
        ref={(el) => addToRefs(el, 4)}
        className="pt-20 lg:pt-24 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight">
              Key Features of Haithe
            </h2>
            <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
              Built for performance, security, and trust
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: CheckCircle,
                title: "On-Chain Claim Manifests",
                description: "Creators make specific, verifiable claims about their AI's data foundation"
              },
              {
                icon: Shield,
                title: "Expert-Led Audits",
                description: "Audits performed by staked domain experts, not just automated checkers"
              },
              {
                icon: Database,
                title: "Granular Audit Reports",
                description: "Detailed reports that verify individual claims, not just pass/fail"
              },
              {
                icon: Users,
                title: "Decentralized Access Control",
                description: "Secure mechanism for temporary, private dataset access for verification"
              },
              {
                icon: Star,
                title: "Incentive-Aligned Ecosystem",
                description: "Rewards for creators and auditors that align with quality and trust"
              },
              {
                icon: Zap,
                title: "Built for Performance",
                description: "Powered by Alith AI framework and Hyperion blockchain for speed"
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-black/30 border border-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 h-full">
                <CardHeader className="p-0 pb-4">
                  <feature.icon className="h-8 w-8 lg:h-10 lg:w-10 text-white mb-4" />
                  <CardTitle className="text-lg lg:text-xl text-white font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section - Simplified */}
      <section
        id="community"
        ref={(el) => addToRefs(el, 5)}
        className="pt-20 lg:pt-24 opacity-0 translate-y-8 transition-all duration-700 my-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight">
              Join the Haithe Community
            </h2>
            <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
              Participate in our testnet and help build the foundation of trust
              for AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {[
              {
                icon: Code,
                title: "Become a Creator",
                description: "Build AI agents with Alith, deploy on our platform, and create Claim Manifests.",
                buttonText: "Start Building"
              },
              {
                icon: Users,
                title: "Act as a Consumer",
                description: "Browse the marketplace, review audit reports, and integrate verified agents.",
                buttonText: "Explore Marketplace"
              },
              {
                icon: Shield,
                title: "Join the Auditor Program",
                description: "Apply with your domain expertise to help verify claims and build trust.",
                buttonText: "Apply Now"
              },
            ].map((community, index) => (
              <Card key={index} className="p-6 lg:p-8 text-center bg-black/30 border border-white/10 backdrop-blur-sm rounded-2xl h-full">
                <div className="h-14 w-14 lg:h-16 lg:w-16 mx-auto mb-4 lg:mb-6 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <community.icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-white">
                  {community.title}
                </h3>
                <p className="text-white/60 mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">
                  {community.description}
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/5 hover:text-white rounded-full text-sm lg:text-base"
                >
                  {community.buttonText}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-20">
        <Footer />
      </section>
    </div>
  );
}
