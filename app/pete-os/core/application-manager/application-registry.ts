import { 
  ApplicationManifest, 
  ApplicationComponent,
  ApplicationEvent,
  ApplicationEventHandler 
} from '../types/application.types';

export interface RegisteredApplication {
  manifest: ApplicationManifest;
  component: ApplicationComponent;
  registeredAt: number;
}

export function createApplicationRegistry() {
  // Private state
  const applications = new Map<string, RegisteredApplication>();
  const eventHandlers = new Set<ApplicationEventHandler>();

  // Private helpers
  const emit = (event: ApplicationEvent): void => {
    eventHandlers.forEach(handler => handler(event));
  };

  // Public API
  return {
    // Event subscription
    subscribe(handler: ApplicationEventHandler): () => void {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },

    // Application registration
    register(
      manifest: ApplicationManifest, 
      component: ApplicationComponent
    ): void {
      const { id } = manifest.metadata;
      
      if (applications.has(id)) {
        throw new Error(`Application with id "${id}" is already registered`);
      }

      const registration: RegisteredApplication = {
        manifest,
        component,
        registeredAt: Date.now()
      };

      applications.set(id, registration);
      emit({ type: 'register', appId: id, manifest });
    },

    unregister(appId: string): boolean {
      const app = applications.get(appId);
      if (!app) return false;

      applications.delete(appId);
      emit({ type: 'unregister', appId });
      return true;
    },

    // Application queries
    getApplication(appId: string): RegisteredApplication | undefined {
      return applications.get(appId);
    },

    getAllApplications(): RegisteredApplication[] {
      return Array.from(applications.values());
    },

    getApplicationsByCategory(category: string): RegisteredApplication[] {
      return Array.from(applications.values())
        .filter(app => app.manifest.metadata.category === category);
    },

    searchApplications(query: string): RegisteredApplication[] {
      const normalizedQuery = query.toLowerCase();
      
      return Array.from(applications.values()).filter(app => {
        const { name, description, keywords = [] } = app.manifest.metadata;
        
        return (
          name.toLowerCase().includes(normalizedQuery) ||
          description?.toLowerCase().includes(normalizedQuery) ||
          keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))
        );
      });
    },

    hasApplication(appId: string): boolean {
      return applications.has(appId);
    },

    // Utility methods
    validateManifest(manifest: ApplicationManifest): string[] {
      const errors: string[] = [];
      
      if (!manifest.metadata.id) {
        errors.push('Application ID is required');
      }
      
      if (!manifest.metadata.name) {
        errors.push('Application name is required');
      }
      
      if (!manifest.metadata.version) {
        errors.push('Application version is required');
      }
      
      // Add more validation as needed
      
      return errors;
    }
  };
}

export type ApplicationRegistryAPI = ReturnType<typeof createApplicationRegistry>;

// Singleton instance
let registryInstance: ApplicationRegistryAPI | null = null;

export function getApplicationRegistry(): ApplicationRegistryAPI {
  if (!registryInstance) {
    registryInstance = createApplicationRegistry();
  }
  return registryInstance;
}

// For testing purposes
export function resetApplicationRegistry(): void {
  registryInstance = null;
} 