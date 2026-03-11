// import type { Config } from "tailwindcss";
// import type { PluginAPI } from "tailwindcss/types/config";
// import plugin from "tailwindcss/plugin";

// const {
//   default: flattenColorPalette,
// } = require("tailwindcss/lib/util/flattenColorPalette");

// function addVariablesForColors({ addBase, theme }: PluginAPI) {
//   let allColors = flattenColorPalette(theme("colors"));
//   let newVars = Object.fromEntries(
//     Object.entries(allColors).map(([key, val]) => [`--${key}`, val as string])
//   );

//   addBase({
//     ":root": newVars,
//   });
// }

// const config: Config = {
//     darkMode: ["class"],
//     content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/**/*.{js,ts,jsx,tsx,mdx}"
//   ],
//   theme: {
//   	extend: {
//   		backgroundImage: {
//   			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//   			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
//   			'animated-bg': 'linear-gradient(45deg, #643ADE , #A4C8FF75)'
//   		},
//   		fontFamily: {
//   			ttfirs: ["TT Firs Neue", "sans-serif"],
//   			sourceCode: ["Source Code Pro", "sans-serif"]
//   		},
//   		colors: {
//   			zkIndigo: '#A4C8FF',
//   			zkIndigo60: '#A4C8FF75',
//   			zkLightPurple: '#A992ED',
//   			zkLightPurple120: '#8160E4CC',
//   			zkPurple: '#643ADE',
//   			zkLightRed: '#793698',
//   			zkLightBlue: '#70A9FF',
//   			zkDarkBlue: '#040b27',
//   			zkDarkerBlue: '#272A4480',
//   			zkBlue: '#70A9FF4D',
//   			zkDarkPurple: '#7E83A9',
//   			zkBackground: '#010921',
//   			zkDarkBackground: '#12152B',
//   			zkDarkBackground50: '#12152B80',
//   			zkDarkerBackground: '#010921',
//   			zkNeonGreen: '#2AF698',
//   			zkLavender: '#5A49AC',
//   			background: 'hsl(var(--background))',
//   			foreground: 'hsl(var(--foreground))',
//   			card: {
//   				DEFAULT: 'hsl(var(--card))',
//   				foreground: 'hsl(var(--card-foreground))'
//   			},
//   			popover: {
//   				DEFAULT: 'hsl(var(--popover))',
//   				foreground: 'hsl(var(--popover-foreground))'
//   			},
//   			primary: {
//   				DEFAULT: 'hsl(var(--primary))',
//   				foreground: 'hsl(var(--primary-foreground))'
//   			},
//   			secondary: {
//   				DEFAULT: 'hsl(var(--secondary))',
//   				foreground: 'hsl(var(--secondary-foreground))'
//   			},
//   			muted: {
//   				DEFAULT: 'hsl(var(--muted))',
//   				foreground: 'hsl(var(--muted-foreground))'
//   			},
//   			accent: {
//   				DEFAULT: 'hsl(var(--accent))',
//   				foreground: 'hsl(var(--accent-foreground))'
//   			},
//   			destructive: {
//   				DEFAULT: 'hsl(var(--destructive))',
//   				foreground: 'hsl(var(--destructive-foreground))'
//   			},
//   			border: 'hsl(var(--border))',
//   			input: 'hsl(var(--input))',
//   			ring: 'hsl(var(--ring))',
//   			chart: {
//   				'1': 'hsl(var(--chart-1))',
//   				'2': 'hsl(var(--chart-2))',
//   				'3': 'hsl(var(--chart-3))',
//   				'4': 'hsl(var(--chart-4))',
//   				'5': 'hsl(var(--chart-5))'
//   			}
//   		},
//   		animation: {
//   			scroll: 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
//   			rotateBg: 'rotateGradient 3s ease-in infinite'
//   		},
//   		keyframes: {
//   			scroll: {
//   				to: {
//   					transform: 'translate(calc(-50% - 0.5rem))'
//   				}
//   			},
//   			rotateGradient: {
//   				'0%': {
//   					'background-image': 'linear-gradient(0deg,#643ADE , #A4C8FF75)'
//   				},
//   				'100%': {
//   					'background-image': 'linear-gradient(360deg,#643ADE , #A4C8FF75 )'
//   				}
//   			}
//   		},
//   		screens: {
//   			'3xl': '1792px',
//   			'4xl': '2048px'
//   		},
//   		borderRadius: {
//   			lg: 'var(--radius)',
//   			md: 'calc(var(--radius) - 2px)',
//   			sm: 'calc(var(--radius) - 4px)'
//   		}
//   	}
//   },
//   plugins: [
//     addVariablesForColors,
//     plugin(function ({ matchUtilities, theme }: PluginAPI) {
//       matchUtilities(
//         {
//           "bg-gradient": (angle: string) => ({
//             "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
//           }),
//         },
//         {
//           values: Object.assign(
//             theme("bgGradientDeg", {}),
//             {
//               10: "10deg",
//               15: "15deg",
//               20: "20deg",
//               25: "25deg",
//               30: "30deg",
//               45: "45deg",
//               60: "60deg",
//               90: "90deg",
//               120: "120deg",
//               135: "135deg",
//             }
//           ),
//         }
//       );
//     }),
//       require("tailwindcss-animate")
// ],
// };

// export default config;


import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";
import plugin from "tailwindcss/plugin";

const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

function addVariablesForColors({ addBase, theme }: PluginAPI) {
	let allColors = flattenColorPalette(theme("colors"));
	let newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val as string])
	);

	addBase({
		":root": newVars,
	});
}

const config = {
	darkMode: ["class"],
	content: [
		'./src/pages/**/*.{ts,tsx}',
		'./src/components/**/*.{ts,tsx}',
		'./src/app/**/*.{ts,tsx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			colors: {
				// Your custom ZK colors
				zkIndigo: '#A4C8FF',
				zkIndigo60: '#A4C8FF75',
				zkLightPurple: '#A992ED',
				zkLightPurple120: '#8160E4CC',
				zkPurple: '#643ADE',
				zkLightRed: '#793698',
				zkLightBlue: '#70A9FF',
				zkDarkBlue: '#040b27',
				zkDarkerBlue: '#272A4480',
				zkBlue: '#70A9FF4D',
				zkDarkPurple: '#7E83A9',
				zkBackground: '#010921',
				zkDarkBackground: '#12152B',
				zkDarkBackground50: '#12152B80',
				zkDarkerBackground: '#010921',
				zkNeonGreen: '#2AF698',
				zkLavender: '#5A49AC',
				// New design system colors
				dsBg: '#07090f',
				dsBgAlt: '#0b0e17',
				dsPurple: {
					DEFAULT: '#7c6af7',
					light: '#a78bfa',
					dark: '#4f46e5',
				},
				dsGreen: '#34d399',
				dsMuted: {
					DEFAULT: '#6b7280',
					dark: '#374151',
				},
				dsBorder: '#1e2333',
				// Default theme colors
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
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			fontFamily: {
				ttfirs: ["TT Firs Neue", "sans-serif"],
				sourceCode: ["Source Code Pro", "sans-serif"],
				abeezee: ['ABeeZee', 'sans-serif'],
				dmSans: ['DM Sans', 'sans-serif'],
				dmMono: ['DM Mono', 'monospace'],
				syne: ['Syne', 'sans-serif'],
			},
			keyframes: {
				blink: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
				rotateGlow: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				blink: 'blink 1s step-end infinite',
				rotateGlow: 'rotateGlow 3s linear infinite',
				float: 'float 3s ease-in-out infinite',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			}
		},
	},
	plugins: [
		addVariablesForColors,
		require("tailwindcss-animate")
	],
} satisfies Config;

export default config;