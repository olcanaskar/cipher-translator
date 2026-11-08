import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.olcan.ciphertranslator',
  appName: 'Cipher Translator',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
