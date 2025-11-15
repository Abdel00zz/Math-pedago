/**
 * Déclaration TypeScript globale pour MathJax v4
 * Utilisé dans tout le projet Pedago
 */
declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements?: HTMLElement[]) => void;
      startup?: {
        promise?: Promise<void>;
        defaultReady?: () => void;
        adaptor?: {
          outerHTML: (node: HTMLElement) => string;
        };
      };
      tex2chtmlPromise?: (math: string, options?: any) => Promise<HTMLElement>;
      tex2svgPromise?: (math: string, options?: any) => Promise<HTMLElement>;
      tex2chtml?: (math: string, options?: any) => HTMLElement;
      tex2svg?: (math: string, options?: any) => HTMLElement>;
      texReset?: () => void;
    };
    /** Indicateur global que MathJax est complètement chargé et prêt */
    mathJaxReady?: boolean;
  }
}

export {};
