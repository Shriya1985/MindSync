import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        mint: {
          50: "hsl(155, 80%, 96%)",
          100: "hsl(155, 70%, 90%)",
          200: "hsl(155, 65%, 82%)",
          300: "hsl(155, 60%, 70%)",
          400: "hsl(155, 65%, 55%)",
          500: "hsl(155, 65%, 45%)",
          600: "hsl(155, 60%, 38%)",
          700: "hsl(155, 55%, 30%)",
          800: "hsl(155, 50%, 22%)",
          900: "hsl(155, 45%, 15%)",
        },
        sky: {
          50: "hsl(200, 100%, 97%)",
          100: "hsl(200, 95%, 92%)",
          200: "hsl(200, 90%, 85%)",
          300: "hsl(200, 85%, 75%)",
          400: "hsl(200, 80%, 65%)",
          500: "hsl(200, 75%, 55%)",
          600: "hsl(200, 70%, 45%)",
          700: "hsl(200, 65%, 35%)",
          800: "hsl(200, 60%, 25%)",
          900: "hsl(200, 55%, 15%)",
        },
        lavender: {
          50: "hsl(270, 65%, 95%)",
          100: "hsl(270, 60%, 88%)",
          200: "hsl(270, 55%, 80%)",
          300: "hsl(270, 50%, 70%)",
          400: "hsl(270, 45%, 60%)",
          500: "hsl(270, 40%, 50%)",
          600: "hsl(270, 45%, 40%)",
          700: "hsl(270, 50%, 30%)",
          800: "hsl(270, 55%, 20%)",
          900: "hsl(270, 60%, 12%)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
