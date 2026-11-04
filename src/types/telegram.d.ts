declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        // Per-user cloud storage (Bot API 6.9+): survives webview resets and follows the user
        CloudStorage?: {
          setItem: (key: string, value: string, callback?: (error: string | null, stored?: boolean) => void) => void;
          getItems: (keys: string[], callback: (error: string | null, values?: Record<string, string>) => void) => void;
          removeItems: (keys: string[], callback?: (error: string | null, removed?: boolean) => void) => void;
        };
        isVersionAtLeast?: (version: string) => boolean;
        colorScheme?: 'light' | 'dark';
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
      };
    };
  }
}

export {};
