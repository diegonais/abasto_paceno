module.exports = () => ({
  name: process.env.EAS_BUILD ? 'Abasto Boliviano' : ' ',
  slug: 'abasto-boliviano-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/app-icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#fffaf3',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.abastoboliviano.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/app-icon.png',
      backgroundColor: '#fffaf3',
    },
    edgeToEdgeEnabled: true,
  },
  plugins: ['expo-font'],
  extra: {
    eas: {
      projectId: 'd06245c8-4ba2-4e13-99b5-ee37d101dad8',
    },
  },
  owner: 'diegonais',
});
