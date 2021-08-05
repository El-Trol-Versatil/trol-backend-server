const generateId = function() {
  return Math.floor(Math.random() * (9999999999 - 1000000000)) + 1000000000;
}

const roundedRandomNumber = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + max;
}

const randomStrings = function(stringArray) {
  const minArraySize = Math.ceil(stringArray.length * 0.60),
    maxArraySize = Math.floor(stringArray.length * 0.90),
    numberOfElements = roundedRandomNumber(minArraySize, maxArraySize),
    finalValues = stringArray.slice();
  for (let index = 0; index < stringArray.length - numberOfElements; index++) {
    const randomIndex = roundedRandomNumber(0, numberOfElements - index);
    finalValues.splice(randomIndex, 1);
  }
  return finalValues;
}

const utilsHelper = {
  generateId,
  roundedRandomNumber,
  randomStrings,
};

module.exports = utilsHelper;