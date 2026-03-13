import tailwindcssAnimate from "tailwindcss-animate"
import tailwindcssForms from "@tailwindcss/forms"

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			tesla: '1rem',
  			'tesla-pill': '9999px'
  		},
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			},
  			tesla: {
  				surface: 'var(--color-surface)',
  				elevated: 'var(--color-elevated)',
  				border: 'var(--color-border)',
  				text: 'var(--color-text)',
  				muted: 'var(--color-muted)',
  				red: '#E31937',
  				blue: '#3E6AE1'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'"Plus Jakarta Sans"',
  				'Inter',
  				'sans-serif'
  			]
  		},
  		fontWeight: {
  			light: '200',
  			normal: '300',
  			medium: '400',
  			semibold: '500',
  			bold: '600'
  		},
  		boxShadow: {
  			glow: '0 0 15px rgba(227, 25, 55, 0.4)',
  			neumorphic: 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.05)',
  			soft: '0 4px 20px rgba(0, 0, 0, 0.05)',
  			premium: '0 10px 40px rgba(0, 0, 0, 0.1)'
  		},
  		letterSpacing: {
  			tight: '-0.02em',
  			normal: '0',
  			wide: '0.02em'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    tailwindcssForms,
    tailwindcssAnimate
  ],
}
