import type { BrowserOptions, browserTracingIntegration } from '@sentry/browser';
import type { Transaction, TransactionContext } from '@sentry/types';

type BrowserTracingOptions = Parameters<typeof browserTracingIntegration>[0];

export type EmberSentryConfig = {
  sentry: BrowserOptions & { browserTracingOptions?: BrowserTracingOptions };
  transitionTimeout: number;
  ignoreEmberOnErrorWarning: boolean;
  disableInstrumentComponents: boolean;
  disablePerformance: boolean;
  disablePostTransitionRender: boolean;
  disableRunloopPerformance: boolean;
  disableInitialLoadInstrumentation: boolean;
  enableComponentDefinitions: boolean;
  minimumRunloopQueueDuration: number;
  minimumComponentRenderDuration: number;
  browserTracingOptions: BrowserTracingOptions;
};

export type OwnConfig = {
  sentryConfig: EmberSentryConfig;
};

// This is private in Ember and not really exported, so we "mock" these types here.
export interface EmberRouterMain {
  location: {
    getURL?: () => string;
    formatURL?: (url: string) => string;
    implementation: string;
    rootURL: string;
  };
}
/** @deprecated This will be removed in v8. */
export type StartTransactionFunction = (context: TransactionContext) => Transaction | undefined;

export type GlobalConfig = {
  __sentryEmberConfig: EmberSentryConfig['sentry'];
};
