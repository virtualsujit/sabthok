/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          element: HTMLElement,
          options: Record<string, any>
        ) => void;
        prompt: () => void;
      };
    };
  };
}
