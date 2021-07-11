const Trollnet = require('../models/trollnet.model.js');

const initializeTrollnets = function () {
  // TODO. Still nothing needed.
}

const trollnetDaemon = function () {
  // TODO. Still nothing needed.
}
  
//GET - Return all trollnets in the DB
const getAllTrollnets = function (req, res) {
  Trollnet.find({}, '-_id -__v', function (err, trollnets) {
    if (err) {
      console.log('FAILED GET getAllTrollnets');
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS GET getAllTrollnets');
      res.status(200).jsonp(trollnets);
    }
  });
};

//GET - Return a trollnet with specified ID
const getTrollnetById = function (req, res) {
  Trollnet.findOne({ id: req.params.id }, function (err, trollnet) {
    if (err) {
      console.log('FAILED GET getTrollnetById ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      const object = trollnet.toObject();
      delete object._id;
      delete object.__v;
      console.log('SUCCESS GET getTrollnetById ' + req.params.id);
      res.status(200).jsonp(object);
    }
  });
};

//POST - Return a trollnet with specified ID
const addTrollnet = function (req, res) {
  const generatedId = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  let newTrollnet = new Trollnet({
    id: 'trollnet' + generatedId,
    isActive: false,
    properties: req.body
  });
  newTrollnet.save(function (err, trollnet) {
    if (err) {
      console.log('FAILED POST addTrollnet ' + req.body.customName);
      res.status(500).send(err.message);
    } else {
      const object = trollnet.toObject();
      delete object._id;
      delete object.__v;
      console.log('SUCCESS POST addTrollnet ' + req.body.customName);
      res.status(200).jsonp(object);
    }
  });
};

//DELETE - Delete a trollnet with specified ID
const deleteTrollnet = function (req, res) {
  Trollnet.deleteOne({ id: req.params.id }, function (err) {
    if (err) {
      console.log('FAILED DELETE deleteTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS DELETE deleteTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' deleted sucessfully' });
    }
  });
};

//PUT '/rename/:id' - Rename a trollnet with specified ID
const renameTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { properties: { customName: req.body.newName } } }, function (err) {
    if (err) {
      console.log('FAILED PUT renameTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT renameTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'renamed sucessfully' });
    }
  })
};

//PUT '/activate/:id' - Activate a trollnet with specified ID
const activateTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { isActive: true } }, function (err) {
    if (err) {
      console.log('FAILED PUT activateTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT activateTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'activated sucessfully' });
    }
  })
};

//PUT '/deactivate/:id' - Deactivate a trollnet with specified ID
const deactivateTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { isActive: false } }, function (err) {
    if (err) {
      console.log('FAILED PUT deactivateTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT deactivateTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'deactivated sucessfully' });
    }
  })
};

const trollnetController = {
  initializeTrollnets,
  trollnetDaemon,
  getAllTrollnets,
  getTrollnetById,
  addTrollnet,
  deleteTrollnet,
  renameTrollnet,
  activateTrollnet,
  deactivateTrollnet
};

module.exports = trollnetController;