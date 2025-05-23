export interface ApplicationMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  icon?: string;
  category?: ApplicationCategory;
  keywords?: string[];
  permissions?: ApplicationPermission[];
}

export type ApplicationCategory = 
  | 'system'
  | 'utility'
  | 'productivity'
  | 'development'
  | 'media'
  | 'communication'
  | 'other';

export type ApplicationPermission = 
  | 'filesystem'
  | 'network'
  | 'camera'
  | 'microphone'
  | 'notifications'
  | 'clipboard'
  | 'fullscreen';

export interface ApplicationManifest {
  metadata: ApplicationMetadata;
  capabilities: ApplicationCapabilities;
  windowDefaults?: WindowDefaults;
  launchOptions?: LaunchOptions;
}

export interface ApplicationCapabilities {
  supportsMultipleInstances?: boolean;
  supportsSuspend?: boolean;
  supportsBackgroundMode?: boolean;
  acceptsFileTypes?: string[];
  providesServices?: string[];
  consumesServices?: string[];
}

export interface WindowDefaults {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  movable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
}

export interface LaunchOptions {
  singleton?: boolean;
  autoStart?: boolean;
  hidden?: boolean;
  args?: string[];
}

export type ApplicationState = 
  | 'unloaded'
  | 'loading'
  | 'running'
  | 'suspended'
  | 'stopping'
  | 'crashed';

export interface ApplicationInstance {
  id: string;
  appId: string;
  state: ApplicationState;
  windowIds: string[];
  startTime: number;
  lastActiveTime: number;
  context: ApplicationContext;
}

export interface ApplicationContext {
  args?: string[];
  env?: Record<string, string>;
  workingDirectory?: string;
  userData?: Record<string, unknown>;
}

export type ApplicationEvent = 
  | { type: 'register'; appId: string; manifest: ApplicationManifest }
  | { type: 'unregister'; appId: string }
  | { type: 'launch'; appId: string; instanceId: string; context?: ApplicationContext }
  | { type: 'terminate'; instanceId: string; reason?: string }
  | { type: 'suspend'; instanceId: string }
  | { type: 'resume'; instanceId: string }
  | { type: 'stateChange'; instanceId: string; from: ApplicationState; to: ApplicationState }
  | { type: 'error'; instanceId: string; error: Error };

export interface ApplicationEventHandler {
  (event: ApplicationEvent): void;
}

export interface ApplicationComponent {
  render: (props: ApplicationRenderProps) => React.ReactElement;
  onMount?: (context: ApplicationContext) => void | Promise<void>;
  onUnmount?: () => void | Promise<void>;
  onSuspend?: () => void | Promise<void>;
  onResume?: () => void | Promise<void>;
}

export interface ApplicationRenderProps {
  instanceId: string;
  context: ApplicationContext;
  sendMessage: (message: InterAppMessage) => void;
}

export interface InterAppMessage {
  from: string;
  to: string | '*';
  type: string;
  payload?: unknown;
  timestamp: number;
} 