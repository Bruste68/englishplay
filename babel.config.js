module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './app',
            '@styles': './shared/styles',
            '@assets': './assets',
            '@components': './app/components',
            '@hooks': './app/hooks',
            '@lib': './app/lib'
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json']
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
