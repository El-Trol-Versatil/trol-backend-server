const generateId = function() {
  return Math.floor(Math.random() * (9999999999 - 1000000000)) + 1000000000;
}

const randomIntegerInInterval = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getIntervalPortion = function (value, min, max) {
  return (value - min) / (max - min);
}

const randomElementFromArray = function(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

const splitRandomlyByCoef = function (sourceArray, portion, finalArray1, finalArray2) {
  const shuffledArray = _shuffleArray(sourceArray.slice()),
    integerPortion = Math.round(portion * shuffledArray.length);
  shuffledArray.forEach((element, index) => {
    (index < integerPortion)
    ? finalArray1.push(element)
    : finalArray2.push(element)
  });
}

/**
 * Using Fisher-Yates Shuffle
 * @param {*} array 
 */
function _shuffleArray(array) {
  let temporaryValue, randomIndex,
    currentIndex = array.length;
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function stringToAscii(stringCoded) {
  let output = '';
  stringCoded.split('').forEach((char, index) => {
    output += char.charCodeAt(0);
    if (index !== stringCoded.length - 1) {
      output += ' ';
    }
  });
  return output;
}

function asciiToString(asciiCoded) {
  let output = '';
  asciiCoded.split(' ').forEach(code => {
    output += String.fromCharCode(code);
  });
  return output;
}

const utilsHelper = {
  generateId,
  randomIntegerInInterval,
  randomElementFromArray,
  getIntervalPortion,
  splitRandomlyByCoef,
  stringToAscii,
  asciiToString,
};

module.exports = utilsHelper;