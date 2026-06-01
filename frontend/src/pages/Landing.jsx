import React, { useEffect, useRef } from "react";
import {
  Users,
  MessageCircle,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { motion } from "framer-motion";
import gsap from "gsap";
import { NavLink } from "react-router-dom";

export default function DevResilience3D() {
  const heroRef = useRef(null);
  const floatingRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      {
        opacity: 0,
        y: 80,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "power4.out",
      },
    );

    floatingRef.current.forEach((el, index) => {
      gsap.to(el, {
        y: index % 2 === 0 ? -25 : 25,
        x: index % 2 === 0 ? 15 : -15,
        duration: 4 + index,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }, []);

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Shared Stories",
      status: "Live",
      desc: "Read real accounts of developers navigating their careers. Share your own experiences, drop comments, and engage in honest discussions.",
    },

    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Network",
      status: "Upcoming",
      desc: "Connect with people who understand the journey. A growing space focused on peer support rather than networking or recruiting.",
    },

    {
      icon: <Shield className="w-8 h-8" />,
      title: "ChatJam",
      status: "Live",
      desc: "Join small community support rooms. A secure, calm space to express challenges, listen to others, and grow together.",
    },

    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Growth Reflections",
      status: "Upcoming",
      desc: "Explore common themes and takeaways from community discussions to aid in your own learning and resilience building.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#0ea5e920,transparent_40%),radial-gradient(circle_at_bottom_right,#9333ea20,transparent_40%)]" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* FLOATING LIGHTS */}
      <div
        ref={(el) => (floatingRef.current[0] = el)}
        className="absolute top-24 left-16 w-44 h-44 bg-cyan-500/20 blur-[120px] rounded-full"
      />

      <div
        ref={(el) => (floatingRef.current[1] = el)}
        className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/20 blur-[140px] rounded-full"
      />

      <div
        ref={(el) => (floatingRef.current[2] = el)}
        className="absolute top-1/2 left-1/2 w-40 h-40 bg-pink-500/10 blur-[100px] rounded-full"
      />

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-black tracking-wide sm:text-10px">
          Dev<span className="text-cyan-400">Resilience</span>
        </h1>

        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">About</a>
        </div>

        <div className="flex gap-3">
          <NavLink to="auth">
            <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              Login
            </button>
          </NavLink>
          <NavLink to="auth">
            <button className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:scale-105 transition">
              Register
            </button>
          </NavLink>
        </div>
      </motion.nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-36"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
          }}
          className="text-6xl md:text-8xl font-black leading-tight max-w-6xl"
        >
          Developers Supporting
          <span className="text-cyan-400"> Developers</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          className="mt-8 text-lg text-gray-400 max-w-3xl leading-relaxed"
        >
          A growing space for developers navigating challenges together. Start
          meaningful conversations, share experiences openly, and connect with
          people who understand the journey.
        </motion.p>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          <NavLink to="auth">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 40px rgba(34,211,238,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 rounded-2xl bg-cyan-400 text-black font-bold flex items-center gap-2"
            >
              Join the Community
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </motion.button>
          </NavLink>

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            Explore Discussions
          </motion.button>
        </div>

        {/* HERO CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full">
          {[
            {
              title: "Shared Experiences",
              desc: "Read and write real stories",
            },

            {
              title: "Authentic Discussions",
              desc: "No corporate buzzwords",
            },

            {
              title: "Growing Together",
              desc: "A small, supportive peer group",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>

              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">Platform Features</h2>

          <p className="text-gray-400 mt-5 max-w-3xl mx-auto">
            Everything you need to navigate your engineering journey with
            support and confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -12,
                rotateX: 5,
                rotateY: 5,
              }}
              className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan-400/10 to-purple-500/10" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-cyan-400">{item.icon}</div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Live"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>

                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">Why Join Our Community?</h2>

          <p className="text-gray-400 mt-5">
            We're an early community focused on authentic support and growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Safe & Anonymous",
              desc: "Your privacy is our priority. Share freely without judgment.",
            },

            {
              title: "Real Support",
              desc: "Connect with people who truly understand your struggles.",
            },

            {
              title: "Community-Driven",
              desc: "Built by engineers, for engineers navigating their path.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>

              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              number: "01",
              title: "Sign Up",
              desc: "Join the developer community",
            },

            {
              number: "02",
              title: "Connect",
              desc: "Find peers and support circles",
            },

            {
              number: "03",
              title: "Share",
              desc: "Read and write stories",
            },

            {
              number: "04",
              title: "Grow",
              desc: "Build your resilience",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -8,
              }}
              className="relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="text-5xl font-black text-cyan-400/30 mb-6">
                {item.number}
              </div>

              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>

              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <motion.div
          whileHover={{
            scale: 1.01,
          }}
          className="relative overflow-hidden rounded-[40px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-2xl p-14 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,#22d3ee15,transparent_60%)]" />

          <div className="relative z-10">
            <h2 className="text-5xl font-black max-w-4xl mx-auto leading-tight">
              Ready to Start Meaningful Conversations?
            </h2>

            <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
              Join an early-stage community built by developers, for developers
              navigating their path.
            </p>
            <NavLink to="auth">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 0px 40px rgba(34,211,238,0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="mt-10 px-10 py-5 rounded-2xl bg-cyan-400 text-black font-bold text-lg"
              >
                Enter the Community
              </motion.button>
            </NavLink>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-gray-500">
        © 2026 DevResilience — Built for developers navigating the journey
        together.
      </footer>
    </div>
  );
}
