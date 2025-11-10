import { create } from "storybook/theming/create";

export default create({
	base: "light",
	// Typography
	fontBase: '"Inter", system-ui, sans-serif',
	fontCode: "monospace",

	brandTitle: "Flowtomic",
	brandImage: "/a_modern_minimalist_logo_for_flowtomic.jpeg",
	brandTarget: "_self",

	// Colors - Baseado no design system do Flowtomic
	colorPrimary: "hsl(222.2, 47.4%, 11.2%)",
	colorSecondary: "hsl(222.2, 47.4%, 11.2%)",

	// UI
	appBg: "hsl(0, 0%, 100%)",
	appContentBg: "hsl(0, 0%, 100%)",
	appPreviewBg: "hsl(0, 0%, 100%)",
	appBorderColor: "hsl(214.3, 31.8%, 91.4%)",
	appBorderRadius: 8,

	// Text colors
	textColor: "hsl(222.2, 84%, 4.9%)",
	textInverseColor: "hsl(210, 40%, 98%)",

	// Toolbar default and active colors
	barTextColor: "hsl(215.4, 16.3%, 46.9%)",
	barSelectedColor: "hsl(222.2, 47.4%, 11.2%)",
	barHoverColor: "hsl(222.2, 47.4%, 11.2%)",
	barBg: "hsl(0, 0%, 100%)",

	// Form colors
	inputBg: "hsl(0, 0%, 100%)",
	inputBorder: "hsl(214.3, 31.8%, 91.4%)",
	inputTextColor: "hsl(222.2, 84%, 4.9%)",
	inputBorderRadius: 8,
});
