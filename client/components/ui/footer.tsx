import { Link } from "react-router-dom";
import { Brain, Heart, Twitter, Instagram, Linkedin } from "lucide-react";

const footerNavigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Chatbot", href: "/chatbot" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Journal", href: "/journal" },
    { name: "Resources", href: "/resources" },
  ],
  support: [
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
  social: [
    {
      name: "Twitter",
      href: "#",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "#",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: Linkedin,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-mint-50 to-sky-50 border-t border-mint-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-mint-500 to-sky-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                MindSync
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Your AI-powered mental wellness companion. Check in with your
              mind, track your emotions, and build healthier habits—one day at a
              time.
            </p>
            <div className="flex items-center space-x-1 text-mint-600 text-sm font-medium">
              <Heart className="w-4 h-4" />
              <span>"Mental wellness begins with one small check-in."</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {footerNavigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-600 hover:text-mint-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-600 hover:text-mint-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-mint-200 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} MindSync. Made with care for your
            mental wellness.
          </div>

          {/* Social links */}
          <div className="flex items-center space-x-4">
            {footerNavigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-mint-600 transition-colors"
                aria-label={item.name}
              >
                <item.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Mental health disclaimer */}
        <div className="mt-6 pt-6 border-t border-mint-200">
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
            <strong>Important:</strong> MindSync is designed to support your
            mental wellness journey but is not a substitute for professional
            mental health care. If you're experiencing a mental health crisis,
            please contact your local emergency services or call a mental health
            helpline immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
