"use strict";

var express = require("express");
var app = express();

var TOTAL_SUM = 20;
var N = 7;

var allcombos = [];
var allCombosNoPairs = [];
var metrics = {};

var port = 3018;

function _getAllMatchesNchooseM(m, sum, arr, testArray, allMatches) {
  if(m === 0) {
    var matchSum = 0;
    var matchSumString = '';
    for(var k = 0; k < testArray.length; k++) {
      matchSum += arr[testArray[k]];
      if(k > 0) {
        matchSumString += ',';
      }
      matchSumString += arr[testArray[k]];
    }
    //console.log("testArray.length is: " + testArray.length);
    //console.log(matchSumString + " sum is: " + matchSum);
    if(matchSum === sum) {
      var newMatch = [];
      for(var l = 0; l < testArray.length; l++) {
        newMatch.push(arr[testArray[l]]);
      }
      allMatches.push(newMatch);
    }
    return allMatches;
  } else {
    m -= 1;
    var start = testArray.length > 0 ? testArray[testArray.length - 1] + 1: 0;
    for(var i=start; i < arr.length - m; i++) {
      var newTestArray = testArray.slice();
      newTestArray.push(i);
      _getAllMatchesNchooseM(m, sum, arr, newTestArray, allMatches); 
    }
    return allMatches;
  }
}

function getAllMatchesChooseM(m, sum, arr) {
  var allMatches = [];
  var testArray = [];
  return _getAllMatchesNchooseM(m, sum, arr, testArray, allMatches);
}

function getAllMatches(sum, arr) {
  return _getAllMatches(N, sum, arr);
}

function _getAllMatches(m, sum, arr) {
  if (m === 0) {
    return [];
  }
  var matches = getAllMatchesChooseM(m, sum, arr);
  return matches.concat(_getAllMatches(m - 1, sum, arr));
}

function initAllCombosN(sum, setsize) {
  setsize -= 1;
  var comboArray = [1];
  _initAllCombosN(sum, setsize, comboArray);
}

function _initAllCombosN(sum, setsize, comboArray) {
  if(setsize === 0) {
    allcombos.push(comboArray);
  } else {
    setsize -= 1;
    var start = comboArray[comboArray.length - 1] + 1;
    for(var i=start; i < sum - setsize; i++) {
      var newComboArray = comboArray.slice();
      newComboArray.push(i);
      _initAllCombosN(sum, setsize, newComboArray); 
    }
  }
}

function initAllCombosNoPairs(sum, setsize) {
  setsize -= 1;
  var comboArray = [1];
  _initAllCombosNoPairs(sum, setsize, comboArray);
}

function _initAllCombosNoPairs(sum, setsize, comboArray) {
  if(setsize === 0) {
    allCombosNoPairs.push(comboArray);
  } else {
    setsize -= 1;
    var start = comboArray[comboArray.length - 1] + 1;
    for(var i=start; i < sum - setsize; i++) {
      console.log("i is: " + i);
      var isPair = false;
      for (var j=0; j<comboArray.length; j++) {
        console.log("j is: " + j + ", comboArray is: " + comboArray);
        var testSum = i + comboArray[j];
        console.log("PAIR: (" + i + "," + comboArray[j] + "), testSum: " + testSum + ", TOTAL_SUM: " + TOTAL_SUM);
        if (testSum === TOTAL_SUM) {
          isPair = true;
          break;
        }
      }
      if (isPair) {
        continue;
      } else {
        var newComboArray = comboArray.slice();
        newComboArray.push(i);
        _initAllCombosNoPairs(sum, setsize, newComboArray); 
      }
    }
  }
}

function getAllCombos(req, res) {
  if (allCombosNoPairs.length === 0) {
    initAllCombosN(TOTAL_SUM, N);
  }

  res.writeHead(200, {"Content-Type":"text/html"});
  res.write("<h1>Subsets of any size summing to " + TOTAL_SUM + " and taken from a set of size " + N + "</h1></br>");
  var len = allcombos.length;
  for(var i=0; i<len; i++) {
    var comboSum = allcombos[i][0] + allcombos[i][1] + allcombos[i][2] + allcombos[i][3] + allcombos[i][4] + allcombos[i][5];
    //var allMatches = getAllMatchesChooseM(M, TOTAL_SUM, allcombos[i]);
    //var allMatches = getAllMatches(M, TOTAL_SUM, allcombos[i]);
    var allMatches = getAllMatches(TOTAL_SUM, allcombos[i]);
    if(allMatches.length > 0) {
      var matchesString = '';
      for(var j=0; j< allMatches.length; j++) {
        if(j > 0) {
          matchesString += ' - ';
        }
        matchesString += allMatches[j];
      }
      res.write((i + 1) + ") " + allcombos[i] + ": hasMatch: " + matchesString + "</br>");
    } else {
      res.write("<b style=\"color:red;\">" + (i + 1) + ") " + allcombos[i] + ": NO match</b></br>");
    }
  }
  res.end();
}

function getCombosWithNoPairs(req, res) {
  if (allCombosNoPairs.length === 0) {
    initAllCombosNoPairs(TOTAL_SUM, N);
  }

  res.writeHead(200, {"Content-Type":"text/html"});
  res.write("<h1>Subsets of any size summing to " + TOTAL_SUM + " and taken from a set of size " + N + "</h1></br>");
  var len = allCombosNoPairs.length;
  for(var i=0; i<len; i++) {
    var comboSum = allCombosNoPairs[i][0] + allCombosNoPairs[i][1] + allCombosNoPairs[i][2] +
                   allCombosNoPairs[i][3] + allCombosNoPairs[i][4] + allCombosNoPairs[i][5];
    var allMatches = getAllMatches(TOTAL_SUM, allCombosNoPairs[i]);
    if(allMatches.length > 0) {
      var matchesString = '';
      for(var j=0; j< allMatches.length; j++) {
        if(j > 0) {
          matchesString += ' - ';
        }
        matchesString += allMatches[j];
      }
      res.write((i + 1) + ") " + allCombosNoPairs[i] + ": hasMatch: " + matchesString + "</br>");
    } else {
      res.write("<b style=\"color:red;\">" + (i + 1) + ") " + allCombosNoPairs[i] + ": NO match</b></br>");
    }
  }
  res.end();
}

app.get("/subsets", function(req, res) {
  if (req.query.noPairs) {
    getCombosWithNoPairs(req, res);
  } else {
    getAllCombos(req, res);
  }
});

app.listen(port, function() {
  console.log("Example app listening on port " + port + "!");
});
