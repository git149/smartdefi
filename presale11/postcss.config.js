module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: ['> 0.15% in CN'],
    },
    "postcss-pxtorem": {
      rootValue: 37.5,
      propList: ["*"],
    },
  },
};
