// Connector plugin — simplified.
// WhatsApp, Instagram, Facebook, OLX, and Webmotors now all use official
// HTTP APIs via Supabase edge functions. No local Baileys/Instagram libraries needed.

function connectorPlugin() {
  return {
    name: 'connector-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Pass through — all integration logic is handled by edge functions
        return next();
      });
      console.log('[Connector] Using official APIs via edge functions — no local server needed');
    },
  };
}

module.exports = connectorPlugin;
