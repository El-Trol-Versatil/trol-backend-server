const generateId = function() {
  return Math.floor(Math.random() * (9999999999 - 1000000000)) + 1000000000;
}

const utilsHelper = {
  generateId,
};

module.exports = utilsHelper;