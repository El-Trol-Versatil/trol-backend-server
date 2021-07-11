const express = require('express'),
      router = express.Router(),
      trollnetCtrl = require('../controllers/trollnet.controller.js'),
      ROUTER_CONFIG = require('../../config/router.config.js');

router
  // routing for '/'
  .get(
    ROUTER_CONFIG.EP_TROLLNET.BASE,
    trollnetCtrl.getAllTrollnets)
  .post(
    ROUTER_CONFIG.EP_TROLLNET.BASE,
    trollnetCtrl.addTrollnet)

  // routing for '/:id'
  .get(
    ROUTER_CONFIG.EP_TROLLNET.BY_ID,
    trollnetCtrl.getTrollnetById)
  .delete(
    ROUTER_CONFIG.EP_TROLLNET.BY_ID,
    trollnetCtrl.deleteTrollnet)

  // routing for '/rename/:id'
  .put(
    ROUTER_CONFIG.EP_TROLLNET.RENAME,
    trollnetCtrl.renameTrollnet)

  // routing for '/activate/:id'
  .put(
    ROUTER_CONFIG.EP_TROLLNET.ACTIVATE,
    trollnetCtrl.activateTrollnet)

  // routing for '/deactivate/:id'
  .put(
    ROUTER_CONFIG.EP_TROLLNET.DEACTIVATE,
    trollnetCtrl.deactivateTrollnet);

module.exports = router;