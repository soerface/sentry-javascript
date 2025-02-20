import { DiagLogLevel, diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SDK_VERSION, getClient } from '@sentry/core';
import { SentryPropagator, SentrySampler, SentrySpanProcessor, setupEventContextTrace } from '@sentry/opentelemetry';
import { logger } from '@sentry/utils';

import { DEBUG_BUILD } from '../debug-build';
import { SentryContextManager } from '../otel/contextManager';
import type { NodeClient } from './client';

/**
 * Initialize OpenTelemetry for Node.
 */
export function initOtel(): void {
  const client = getClient<NodeClient>();

  if (!client) {
    DEBUG_BUILD &&
      logger.warn(
        'No client available, skipping OpenTelemetry setup. This probably means that `Sentry.init()` was not called before `initOtel()`.',
      );
    return;
  }

  if (client.getOptions().debug) {
    const otelLogger = new Proxy(logger as typeof logger & { verbose: (typeof logger)['debug'] }, {
      get(target, prop, receiver) {
        const actualProp = prop === 'verbose' ? 'debug' : prop;
        return Reflect.get(target, actualProp, receiver);
      },
    });

    diag.setLogger(otelLogger, DiagLogLevel.DEBUG);
  }

  setupEventContextTrace(client);

  const provider = setupOtel(client);
  client.traceProvider = provider;
}

/** Just exported for tests. */
export function setupOtel(client: NodeClient): BasicTracerProvider {
  // Create and configure NodeTracerProvider
  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'node',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'sentry',
      [SemanticResourceAttributes.SERVICE_VERSION]: SDK_VERSION,
    }),
    forceFlushTimeoutMillis: 500,
  });
  provider.addSpanProcessor(new SentrySpanProcessor());

  // Initialize the provider
  provider.register({
    propagator: new SentryPropagator(),
    contextManager: new SentryContextManager(),
  });

  return provider;
}
