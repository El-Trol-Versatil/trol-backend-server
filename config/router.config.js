const ROUTER_CONFIG = {

  /*** ROUTING ENDPOINTS & VERBS ***/
  EP_GLOBAL: {
    TROLLNET: '/api/trollnet',
  },
  EP_TROLLNET: {
    BASE:    '',
    BY_ID:   '/:id',
    STATUS:  '/status',
    RENAME:  '/rename/:id',
    ACTIVATE: '/activate/:id',
    DEACTIVATE: '/deactivate/:id',
  },

};

module.exports = ROUTER_CONFIG;