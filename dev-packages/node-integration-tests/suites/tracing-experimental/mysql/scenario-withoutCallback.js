const { loggingTransport } = require('@sentry-internal/node-integration-tests');
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://public@dsn.ingest.sentry.io/1337',
  release: '1.0',
  tracesSampleRate: 1.0,
  transport: loggingTransport,
});

// Stop the process from exiting before the transaction is sent
setInterval(() => {}, 1000);

const mysql = require('mysql');

const connection = mysql.createConnection({
  user: 'root',
  password: 'docker',
});

connection.connect(function (err) {
  if (err) {
    return;
  }
});

Sentry.startSpan(
  {
    op: 'transaction',
    name: 'Test Transaction',
  },
  span => {
    const query = connection.query('SELECT 1 + 1 AS solution');
    const query2 = connection.query('SELECT NOW()', ['1', '2']);

    query.on('end', () => {
      query2.on('end', () => {
        // Wait a bit to ensure the queries completed
        setTimeout(() => {
          span.end();
        }, 500);
      });
    });
  },
);
