import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				judicial: {
					dark: 'hsl(var(--judicial-dark, 26 20 44))',
					navy: 'hsl(var(--judicial-navy, 32 51 84))',
					blue: 'hsl(var(--judicial-blue, 48 71 122))',
					gold: 'hsl(var(--judicial-gold, 42 60 58))',
					lightGold: 'hsl(var(--judicial-lightGold, 45 65 75))',
					accent: 'hsl(var(--judicial-accent, 42 50 45))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px 2px rgba(214, 171, 85, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 20px 5px rgba(214, 171, 85, 0.5)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0) rotateX(0deg) rotateY(0deg)'
					},
					'25%': {
						transform: 'translateY(-8px) rotateX(5deg) rotateY(5deg)'
					},
					'50%': {
						transform: 'translateY(0) rotateX(0deg) rotateY(0deg)'
					},
					'75%': {
						transform: 'translateY(8px) rotateX(-5deg) rotateY(-5deg)'
					}
				},
				'hero-scale-3d': {
					'0%, 100%': {
						transform: 'rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
					},
					'25%': {
						transform: 'rotateY(20deg) rotateX(-10deg) translateZ(20px) scale(1.1)'
					},
					'50%': {
						transform: 'rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
					},
					'75%': {
						transform: 'rotateY(-20deg) rotateX(10deg) translateZ(20px) scale(1.1)'
					}
				},
				'tool-card-float': {
					'0%, 100%': {
						transform: 'translateY(0) rotateX(0deg) rotateY(0deg)'
					},
					'25%': {
						transform: 'translateY(-5px) rotateX(2deg) rotateY(2deg)'
					},
					'50%': {
						transform: 'translateY(0) rotateX(0deg) rotateY(0deg)'
					},
					'75%': {
						transform: 'translateY(5px) rotateX(-2deg) rotateY(-2deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-in': 'slide-in 0.5s ease-out forwards',
				'pulse-glow': 'pulse-glow 2s infinite',
				'float': 'float 3s ease-in-out infinite',
				'hero-scale-3d': 'hero-scale-3d 6s ease-in-out infinite',
				'tool-card-float': 'tool-card-float 4s ease-in-out infinite'
			},
			backdropBlur: {
				xs: '2px',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
