import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Code,
  Palette,
  Zap,
  Star,
  Check,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  Play,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import image from "../assets/canvas.png";
import { Player as LottiePlayer } from "@lottiefiles/react-lottie-player";
import anim from "../assets/anim.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLaunchApp = () => {
    if (isMobile) {
      toast.warning("🚫 Desktop Experience Required", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        bodyClassName: "text-sm",
        bodyStyle: { 
          padding: "8px 0",
          lineHeight: "1.5"
        },
        render: () => (
          <div className="flex flex-col gap-1">
            <div className="font-semibold">🚫 Desktop Experience Required</div>
            <div className="text-gray-300">Please use a laptop or desktop computer for the best experience. Our sketch-to-code tool requires a larger screen and precise drawing capabilities.</div>
          </div>
        )
      });
      return;
    }
    navigate("/sketchtool");
  };

  const features = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Draw Your Vision",
      description:
        "Sketch any website layout with simple drawings and wireframes",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description:
        "Our advanced AI transforms your sketches into production-ready code",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get pixel-perfect websites in seconds, not hours",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Sketch",
      description: "Draw your website idea on our canvas",
    },
    {
      number: "02",
      title: "Generate",
      description: "AI analyzes and converts your sketch",
    },
    {
      number: "03",
      title: "Deploy",
      description: "Get clean, responsive code instantly",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-teal-400/8 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Header - Sleek Glassmorphism */}
      <header className="fixed w-full z-50 px-6 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <img src={logo} alt="logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              PixelPrompt
            </span>
          </div>

          <button
            onClick={handleLaunchApp}
            className="relative overflow-hidden px-5 py-1.5 rounded-full text-sm font-medium bg-gray-800/50 border border-gray-700 hover:border-cyan-400/30 transition-all group"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Launch App
              </span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          </button>
        </nav>
      </header>

      {/* Hero Section with Lottie Animation */}
      <section className=" pt-32 pb-20 px-6 flex items-center justify-center ">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-3" />
              <span className="text-sm font-medium text-gray-300">
                AI-Powered Sketch Conversion
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-white">From</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Sketch
              </span>{" "}
              <span className="text-white">to</span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Code
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg">
              Watch your drawings transform into clean, responsive React
              components with our AI magic.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleLaunchApp}
                className="relative group px-8 py-3.5 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-emerald-500/20"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Gradient blobs */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-emerald-500/20 rounded-full filter blur-3xl" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-500/20 rounded-full filter blur-3xl" />

            {/* Lottie Animation Container */}
            <div className="relative overflow-hidden p-1">
              <div className="absolute inset-0 " />

              {/* Lottie Player - Replace with your actual Lottie implementation */}
              <div className="relative h-full w-full min-h-[400px] rounded-xl flex items-center justify-center">
                {/* Example using @lottiefiles/react-lottie-player */}
                <LottiePlayer
                  src={anim} // Replace with your sketch-to-code animation
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                  className="w-full h-full px-3 py-5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* image section */}
      <section className="w-full max-w-7xl mx-auto px-6 my-10">
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-white">
          <img
            src={image}
            alt="image"
            className="w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                PixelPrompt
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The fastest way to turn your creative vision into reality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:bg-gray-800/70 hover:border-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl p-12 border border-gray-700/50 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Ideas?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers who are already
              creating amazing websites with PixelPrompt.
            </p>
            <button
              onClick={handleLaunchApp}
              className="group bg-gradient-to-r from-emerald-600 to-cyan-600 px-10 py-5 rounded-full text-xl font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg shadow-emerald-500/25"
            >
              <span>Sketch Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                PixelPrompt
              </span>
            </div>
            <div className="flex items-center space-x-8 text-gray-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              © 2025 PixelPrompt. Transforming creativity into code.
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
        progressClassName="bg-gradient-to-r from-emerald-400 to-cyan-400"
      />
    </div>
  );
}
