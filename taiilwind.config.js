// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      animation: {
        gradientMove: "gradientMove 5s ease infinite",
      },
      keyframes: {
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundSize: {
        200: "200% 200%",
      },
    },
  },
};
