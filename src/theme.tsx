import { extendTheme } from "@chakra-ui/react";

const fonts = {
  mono: `'Menlo', monospace`,
  heading: `'Saira', sans-serif`,
  body: `'Saira', sans-serif`,
};

const breakpoints = {
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
};

const theme = extendTheme({
  semanticTokens: {
    colors: {
      text: {
        default: "#ade3b8",
        _dark: "#ade3b8",
      },
      heroGradientStart: {
        default: "#36D1DC",
        _dark: "#36D1DC",
      },
      heroGradientEnd: {
        default: "#ade3b8",
        _dark: "#F2C94C",
      },
      icon: {
        default: "green.500",
        _dark: "green.500",
      },
      subtitle: {
        default: "gray.600",
        _dark: "gray.600",
      },
    },
    radii: {
      button: "12px",
    },
  },
  colors: {
    black: "#16161D",
  },
  fonts,
  breakpoints,
});

export default theme;
