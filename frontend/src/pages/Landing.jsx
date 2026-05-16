import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Users,
  Book,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  Zap,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const containerRef = useRef(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        ".hero-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      );

      gsap.fromTo(
        ".hero-cta",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 },
      );

      // Feature cards scroll animation
      const featureCards = gsap.utils.toArray(".feature-card");
      featureCards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Benefit cards animation
      const benefitCards = gsap.utils.toArray(".benefit-card");
      benefitCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: index * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Background glow animation
      gsap.to(".glow-1", {
        opacity: 0.5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".glow-2", {
        opacity: 0.3,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Book,
      title: "Shared Stories",
      description:
        "Read real accounts of developers navigating their careers. Share your own experiences, drop comments, and engage in honest discussions.",
      color: "primary",
      status: "Live",
    },
    {
      icon: Users,
      title: "Community Network",
      description:
        "Connect with people who understand the journey. A growing space focused on peer support rather than networking or recruiting.",
      color: "secondary",
      status: "Upcoming",
    },
    {
      icon: MessageCircle,
      title: "Support Circles",
      description:
        "Join small community support rooms. A secure, calm space to express challenges, listen to others, and grow together.",
      color: "primary",
      status: "Upcoming",
    },
    {
      icon: TrendingUp,
      title: "Growth Reflections",
      description:
        "Explore common themes and takeaways from community discussions to aid in your own learning and resilience building.",
      color: "secondary",
      status: "Upcoming",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Safe & Anonymous",
      description:
        "Your privacy is our priority. Share freely without judgment.",
    },
    {
      icon: Zap,
      title: "Real Support",
      description: "Connect with people who truly understand your struggles.",
    },
    {
      icon: Heart,
      title: "Community-Driven",
      description: "Built by engineers, for engineers navigating their path.",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background overflow-hidden"
    >
      {/* Animated Background Glows */}
      <div className="glow-1 fixed top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="glow-2 fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="font-heading font-bold text-primary text-2xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-secondary" />
            DevResilience
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-tertiary/70">
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Home
            </span>
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Features
            </span>
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              About
            </span>
          </nav>

          <div className="flex items-center gap-4">
            {!token ? (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="hidden sm:block text-sm font-medium text-tertiary/70 hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-6 py-2.5 bg-primary text-background font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all text-sm"
                >
                  Register
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 bg-primary text-background font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all text-sm"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center space-y-8">
          <h1 className="hero-text font-heading text-5xl md:text-6xl leading-tight">
            Developers Supporting
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Developers
            </span>
          </h1>

          <p className="hero-text text-tertiary/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A growing space for developers navigating challenges together. Start
            meaningful conversations, share experiences openly, and connect with
            people who understand the journey.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-3.5 bg-primary text-background font-bold rounded-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {token ? "Go to Dashboard" : "Join the Community"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="px-8 py-3.5 border border-primary/30 text-primary font-bold rounded-lg hover:bg-primary/10 transition-all"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Discussions
            </button>
          </div>

          {/* Community Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            {/* Card 1 */}
            <div className="glass-card group h-32 overflow-hidden">
              <div className="h-[200%] w-full flex flex-col transition-transform duration-500 ease-in-out group-hover:-translate-y-1/2">
                {/* Top Half (Default) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center bg-white/5 p-4">
                  <Book className="w-8 h-8 text-primary  mb-2" />
                  <p className="text-tertiary font-medium">
                    Shared Experiences
                  </p>
                </div>
                {/* Bottom Half (Hover) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center  bg-primary text-white p-4">
                  <p className="text-lg font-medium opacity-100 text-center">
                    Read and write real stories
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card group h-32 overflow-hidden">
              <div className="h-[200%] w-full flex flex-col transition-transform duration-500 ease-in-out group-hover:-translate-y-1/2">
                {/* Top Half (Default) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center bg-white/5 p-4">
                  <MessageCircle className="w-8 h-8 text-secondary mb-2" />
                  <p className="text-tertiary font-medium">
                    Authentic Discussions
                  </p>
                </div>
                {/* Bottom Half (Hover) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center bg-primary text-white p-4">
                  <p className="text-lg font-medium text-center">
                    No corporate buzzwords
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card group h-32 overflow-hidden">
              <div className="h-[200%] w-full flex flex-col transition-transform duration-500 ease-in-out group-hover:-translate-y-1/2">
                {/* Top Half (Default) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center bg-white/5 p-4">
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <p className="text-tertiary font-medium">Growing Together</p>
                </div>
                {/* Bottom Half (Hover) */}
                <div className="h-1/2 w-full flex flex-col items-center justify-center bg-primary text-white p-4  ">
                  <p className="text-lg font-medium text-center">
                    A small, supportive peer group
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-6 py-24"
      >
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl mb-4">
            Platform Features
          </h2>
          <p className="text-tertiary/60 max-w-2xl mx-auto">
            Everything you need to navigate your engineering journey with
            support and confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card group glass-card p-8 hover:border-white/20 transition-all cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}/20 flex items-center justify-center text-${feature.color} mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-2xl mb-3 group-hover:text-primary transition-colors flex items-center flex-wrap gap-3">
                  {feature.title}
                  <span
                    className={`text-[10px] font-label uppercase tracking-widest px-2 py-0.5 rounded-full border ${feature.status === "Live Now" ? "border-green-500/50 text-green-400 bg-green-500/10" : "border-tertiary/30 text-tertiary/60 bg-white/5"}`}
                  >
                    {feature.status}
                  </span>
                </h3>
                <p className="text-tertiary/70 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="about"
        className="relative z-10 max-w-7xl mx-auto px-6 py-24"
      >
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl mb-4">
            Why Join Our Community?
          </h2>
          <p className="text-tertiary/60 max-w-2xl mx-auto">
            We're an early community focused on authentic support and growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="benefit-card glass-card p-8 text-center hover:border-white/20 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl mb-3">{benefit.title}</h3>
                <p className="text-tertiary/70 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Sign Up",
              description: "Join the developer community",
            },
            {
              step: "02",
              title: "Connect",
              description: "Find peers and support circles",
            },
            {
              step: "03",
              title: "Share",
              description: "Read and write stories",
            },
            { step: "04", title: "Grow", description: "Build your resilience" },
          ].map((item, index) => (
            <div key={index} className="glass-card p-8 text-center">
              <div className="text-4xl font-heading text-primary mb-4">
                {item.step}
              </div>
              <h3 className="font-heading text-xl mb-2">{item.title}</h3>
              <p className="text-tertiary/60 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card p-12 md:p-16 text-center border-primary/30">
          <h2 className="font-heading text-4xl md:text-5xl mb-6">
            Ready to Start Meaningful Conversations?
          </h2>
          <p className="text-tertiary/70 text-lg max-w-2xl mx-auto mb-8">
            Join an early-stage community built by developers, for developers
            navigating their path.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-background font-bold rounded-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all text-lg"
          >
            {token ? "Go to Dashboard" : "Enter the Community"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-tertiary/50 text-sm">
          <p>DevResilience © 2026. Engineered with care for engineers.</p>
        </div>
      </footer>
    </div>
  );
}
