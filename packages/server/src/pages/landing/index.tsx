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
  Github,
  Twitter,
  MessageCircle,
  Play,
} from "lucide-react";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export default function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative w-full">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm mb-8 lg:mb-12 backdrop-blur-sm hover:bg-white/8 transition-all duration-300">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse" />
              <span className="text-white/80 font-medium">
                Decentralized Protocol for Verifiable AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-6 lg:mb-8 leading-none">
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
                className="text-base lg:text-lg bg-white text-black hover:bg-white/90 border-0 px-8 lg:px-10 py-4 lg:py-6 h-auto font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20 w-full sm:w-auto"
              >
                Explore the Ecosystem
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base lg:text-lg bg-black border-white/20 text-white/80 hover:bg-white/5 hover:text-white px-8 lg:px-10 py-4 lg:py-6 h-auto rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 w-full sm:w-auto"
              >
                <Play className="mr-3 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Images Section */}
      <section className="py-16 lg:py-20 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                <img
                  src="/static/aiAbstract.png"
                  alt="Modern architecture representing AI infrastructure"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-white mb-2">
                  AI Infrastructure
                </h3>
                <p className="text-white/60 text-sm">
                  Building the foundation for trusted AI systems
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                <img
                  src="/static/transparentAbstract.png"
                  alt="Abstract perspective representing transparency"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-white mb-2">Transparency</h3>
                <p className="text-white/60 text-sm">
                  Clear insights into AI training and capabilities
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                <img
                  src="/static/verificationAbstract.png"
                  alt="Clean geometric design representing verification"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-white mb-2">
                  Verification Process
                </h3>
                <p className="text-white/60 text-sm">
                  Expert auditors ensuring quality and trust
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section
        id="problem"
        className="py-20 lg:py-24 relative scroll-animate opacity-0 translate-y-8 transition-all duration-1000"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 text-white tracking-tight">
                The Trust Vacuum in Web3 AI
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                The core challenge for AI in Web3 isn't just proving that data
                hasn't been tampered with
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-white/12 to-white/8 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative p-8 lg:p-12 xl:p-16 bg-black/50 border border-white/10 backdrop-blur-sm rounded-3xl hover:border-white/20 transition-all duration-500 hover:scale-[1.02]">
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
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl blur-xl" />
                      <div className="relative bg-red-500/5 rounded-2xl p-6 lg:p-8 border border-red-500/20 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
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
                            <li
                              key={index}
                              className="flex items-start hover:text-white/90 transition-colors duration-300"
                            >
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 lg:mr-4 mt-2 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section
        id="solution"
        className="py-20 lg:py-24 scroll-animate opacity-0 translate-y-8 transition-all duration-1000"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 text-white tracking-tight">
              Haithe: The Solution
            </h2>
            <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
              A trust protocol that enables substantive verification through
              expert auditors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
            {[
              {
                icon: Code,
                title: "Creators",
                description:
                  "Build AI agents and submit detailed claim manifests about their training data",
                gradient: "from-white/12 to-white/6",
                image:
                  "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&h=200&fit=crop&auto=format",
              },
              {
                icon: Shield,
                title: "Auditors",
                description:
                  "Domain experts who stake tokens and verify claims through expert investigation",
                gradient: "from-white/16 to-white/8",
                image:
                  "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=400&h=200&fit=crop&auto=format",
              },
              {
                icon: Users,
                title: "Consumers",
                description:
                  "Developers who browse verified AI agents and integrate them with confidence",
                gradient: "from-white/12 to-white/6",
                image:
                  "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=400&h=200&fit=crop&auto=format",
              },
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-0 group-hover:opacity-100`}
                  />
                  <Card className="relative text-center bg-black/50 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500 rounded-2xl p-6 lg:p-8 group-hover:transform group-hover:scale-105 overflow-hidden h-full">
                    <CardHeader className="pb-4">
                      <div className="mx-auto mb-4 h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl lg:text-2xl text-white font-bold">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-white/60 mt-3 lg:mt-4 text-sm lg:text-base leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 text-white tracking-tight">
                How Haithe Works
              </h2>
              <p className="text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-light px-4">
                A three-part ecosystem with checks and balances between all
                participants
              </p>
            </div>

            <div className="space-y-20 lg:space-y-24">
              {/* Step 1 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-center space-x-4 lg:space-x-6">
                    <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white flex items-center justify-center text-xl lg:text-2xl font-black backdrop-blur-sm">
                      1
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      The Creator: Defining the Claims
                    </h3>
                  </div>
                  <div className="space-y-4 lg:space-y-6 text-white/70 text-base lg:text-lg leading-relaxed pl-18 lg:pl-22">
                    <p>
                      <strong className="text-white font-semibold">
                        Build & Register:
                      </strong>{" "}
                      Developers use the Alith framework to build
                      high-performance AI agents and register them on the Haithe
                      marketplace.
                    </p>
                    <p>
                      <strong className="text-white font-semibold">
                        Submit the Claim Manifest:
                      </strong>{" "}
                      Creators submit a structured manifest with specific,
                      falsifiable claims about the training data.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl" />
                  <Card className="relative p-6 lg:p-8 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl">
                    <h4 className="font-bold mb-4 lg:mb-6 text-white text-lg lg:text-xl">
                      Example Claims:
                    </h4>
                    <ul className="space-y-3 lg:space-y-4 text-white/70 text-sm lg:text-base">
                      {[
                        {
                          label: "Source:",
                          value: "API data from Uniswap v3 on Polygon",
                        },
                        {
                          label: "Date Range:",
                          value: "June 1 - December 31, 2023",
                        },
                        { label: "Content:", value: "Contains no PII data" },
                        {
                          label: "Schema:",
                          value: "token_pair, amount_in, amount_out, gas_price",
                        },
                      ].map((claim, index) => (
                        <li key={index} className="flex">
                          <strong className="text-white/90 mr-2 min-w-fit">
                            {claim.label}
                          </strong>
                          <span>"{claim.value}"</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl" />
                  <Card className="relative p-6 lg:p-8 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl">
                    <h4 className="font-bold mb-4 lg:mb-6 text-white text-lg lg:text-xl">
                      Audit Process:
                    </h4>
                    <ol className="space-y-3 lg:space-y-4 text-white/70 text-sm lg:text-base">
                      {[
                        "Stake tokens to become eligible",
                        "Accept audit request",
                        "Receive secure dataset access",
                        "Investigate each claim",
                        "Publish detailed report",
                      ].map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-white/90 font-semibold mr-3 min-w-fit">
                            {index + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>
                <div className="order-1 lg:order-2 space-y-6 lg:space-y-8">
                  <div className="flex items-center space-x-4 lg:space-x-6">
                    <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white flex items-center justify-center text-xl lg:text-2xl font-black backdrop-blur-sm">
                      2
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      The Auditor: Investigating the Substance
                    </h3>
                  </div>
                  <div className="space-y-4 lg:space-y-6 text-white/70 text-base lg:text-lg leading-relaxed pl-18 lg:pl-22">
                    <p>
                      <strong className="text-white font-semibold">
                        Expert Investigation:
                      </strong>{" "}
                      Domain experts stake tokens and gain secure, time-limited
                      access to investigate claims with genuine expertise.
                    </p>
                    <p>
                      <strong className="text-white font-semibold">
                        Detailed Reporting:
                      </strong>{" "}
                      Auditors publish comprehensive reports to IPFS, confirming
                      or refuting each claim individually.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-center space-x-4 lg:space-x-6">
                    <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white flex items-center justify-center text-xl lg:text-2xl font-black backdrop-blur-sm">
                      3
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      The Consumer: Making Informed Decisions
                    </h3>
                  </div>
                  <div className="space-y-4 lg:space-y-6 text-white/70 text-base lg:text-lg leading-relaxed pl-18 lg:pl-22">
                    <p>
                      <strong className="text-white font-semibold">
                        Discover & Filter:
                      </strong>{" "}
                      Browse the marketplace and filter agents based on audit
                      status and verified characteristics.
                    </p>
                    <p>
                      <strong className="text-white font-semibold">
                        Integrate with Confidence:
                      </strong>{" "}
                      Review detailed audit reports before integration, knowing
                      exactly what you're getting.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl" />
                  <Card className="relative p-6 lg:p-8 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl">
                    <h4 className="font-bold mb-4 lg:mb-6 text-white text-lg lg:text-xl">
                      Consumer Benefits:
                    </h4>
                    <ul className="space-y-3 lg:space-y-4 text-white/70 text-sm lg:text-base">
                      {[
                        "Expert-verified agent characteristics",
                        "Detailed audit reports for each claim",
                        "Risk assessment for integration",
                        "Confidence in high-stakes applications",
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-white/90 mr-3 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 lg:py-24 scroll-animate opacity-0 translate-y-8 transition-all duration-1000"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 text-white tracking-tight">
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
                description:
                  "Creators make specific, verifiable claims about their AI's data foundation",
                color: "text-white",
              },
              {
                icon: Shield,
                title: "Expert-Led Audits",
                description:
                  "Audits performed by staked domain experts, not just automated checkers",
                color: "text-white",
              },
              {
                icon: Database,
                title: "Granular Audit Reports",
                description:
                  "Detailed reports that verify individual claims, not just pass/fail",
                color: "text-white",
              },
              {
                icon: Users,
                title: "Decentralized Access Control",
                description:
                  "Secure mechanism for temporary, private dataset access for verification",
                color: "text-white",
              },
              {
                icon: Star,
                title: "Incentive-Aligned Ecosystem",
                description:
                  "Rewards for creators and auditors that align with quality and trust",
                color: "text-white",
              },
              {
                icon: Zap,
                title: "Built for Performance",
                description:
                  "Powered by Alith AI framework and Hyperion blockchain for speed",
                color: "text-white",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/6 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-0 group-hover:opacity-100" />
                  <Card className="relative bg-black/30 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500 rounded-2xl p-6 lg:p-8 group-hover:transform group-hover:scale-105 h-full">
                    <CardHeader className="p-0 pb-4">
                      <feature.icon
                        className={`h-8 w-8 lg:h-10 lg:w-10 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                      />
                      <CardTitle className="text-lg lg:text-xl text-white font-bold">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-white/60 text-sm lg:text-base leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="py-20 lg:py-24 scroll-animate opacity-0 translate-y-8 transition-all duration-1000"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mx-auto max-w-6xl text-center mb-16 lg:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 text-white tracking-tight">
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
                description:
                  "Build a simple agent with Alith, deploy it on our platform, and create a Claim Manifest for it.",
                buttonText: "Start Building",
              },
              {
                icon: Users,
                title: "Act as a Consumer",
                description:
                  "Browse the marketplace, review claims and audit reports, and integrate agents into test applications.",
                buttonText: "Explore Marketplace",
              },
              {
                icon: Shield,
                title: "Join the Auditor Program",
                description:
                  "Apply with your domain expertise to help verify claims and build the foundation of trust.",
                buttonText: "Apply Now",
              },
            ].map((community, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/6 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-0 group-hover:opacity-100" />
                  <Card className="relative p-6 lg:p-8 text-center bg-black/30 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500 rounded-2xl group-hover:transform group-hover:scale-105 h-full">
                    <div className="h-14 w-14 lg:h-16 lg:w-16 mx-auto mb-4 lg:mb-6 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <community.icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-white">
                      {community.title}
                    </h3>
                    <p className="text-white/60 mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                      {community.description}
                    </p>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/5 hover:text-white rounded-full transition-all duration-300 hover:scale-105 hover:border-white/30 text-sm lg:text-base"
                    >
                      {community.buttonText}
                    </Button>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="text-base lg:text-lg bg-white text-black hover:bg-white/90 border-0 px-10 lg:px-12 py-4 lg:py-6 h-auto font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            >
              Join Our Testnet
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
