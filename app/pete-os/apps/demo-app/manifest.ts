import { ApplicationManifest } from '../../core/types/application.types';

export const demoAppManifest: ApplicationManifest = {
  metadata: {
    id: 'demo-app',
    name: 'Demo Application',
    version: '1.0.0',
    description: 'A demo application to test the Pete OS application framework',
    author: 'Pete OS Team',
    category: 'development',
    keywords: ['demo', 'test', 'example']
  },
  capabilities: {
    supportsMultipleInstances: true,
    supportsSuspend: true,
    supportsBackgroundMode: false
  },
  windowDefaults: {
    width: 500,
    height: 400,
    minWidth: 300,
    minHeight: 200,
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    closable: true
  },
  launchOptions: {
    singleton: false,
    autoStart: false
  }
}; 