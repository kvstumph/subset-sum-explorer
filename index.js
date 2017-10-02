"use strict";

var express = require("express");
var app = express();

const DEFAULT_TOTAL_SUM = 20;
const DEFAULT_N = 7;

var TOTAL_SUM = DEFAULT_TOTAL_SUM;
var N = DEFAULT_N;

var allcombos = [];
var metrics = {};

var port = 3018;

///////////////////////////////////////////////////////////////////////////////////////
//  BEGIN GROUPED
///////////////////////////////////////////////////////////////////////////////////////

function getAllMatchesGrouped(sum, arr) {
  var allMatchesGrouped = [];

  // initialize allMatchesGrouped array
  for (var i=0; i<sum; i++) {
    allMatchesGrouped.push([]);
  }
  var allMatches = _getAllMatches(N, sum, arr);
  for (var j=0; j<allMatches.length; j++) {
    var match = allMatches[j];
    allMatchesGrouped[match.length - 1].push(match);
  }
  return { numMatches: allMatches.length, allMatches: allMatchesGrouped };
}

///////////////////////////////////////////////////////////////////////////////////////
//  END GROUPED
///////////////////////////////////////////////////////////////////////////////////////

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
    // console.log("testArray.length is: " + testArray.length);
    // console.log(matchSumString + " sum is: " + matchSum);
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

function initAllCombosN(options, sum, setsize) {
  allcombos = [];
  setsize -= 1;
  var comboArray = [1];
  _initAllCombosN(options, sum, setsize, comboArray);
}

function _initAllCombosN(options, sum, setsize, comboArray) {
  if(setsize === 0) {
    allcombos.push(comboArray);
  } else {
    setsize -= 1;
    var start = comboArray[comboArray.length - 1] + 1;
    for(var i=start; i < sum - setsize; i++) {
      var newComboArray = comboArray.slice();
      newComboArray.push(i);

      var accept = true;

      if (options.subsetsOfSize) {
        var currentSubsets = getAllMatchesGrouped(sum, newComboArray);
        // if clause1: there are any subsets that are not of the specified size (i.e. subsetsOfSize)
        //   or
        // if clause2: after searching every posible subset we have not found the min number of matches
        //   then
        // don't accept this subset.
        if (currentSubsets.allMatches[options.subsetsOfSize - 1].length !== currentSubsets.numMatches) {
          accept = false;
        } else if (setsize === 0 && currentSubsets.numMatches < options.minMatchesPerSubset) {
          accept = false;
        } else if(options.maxOverlapSize < N && setsize === 0 && currentSubsets.numMatches >= options.minMatchesPerSubset) {
          // calculate acceptable overlap
          var overlapNotAcceptable = false;
          for (var k = 0; k < currentSubsets.allMatches[options.subsetsOfSize - 1].length; k++) {
            // console.log("KVS: k is: " + k);
            for (var j = k + 1; j < currentSubsets.allMatches[options.subsetsOfSize - 1].length; j++) {
              // console.log("KVS: j is: " + j);
              var subsetOne = currentSubsets.allMatches[options.subsetsOfSize - 1][k];
              var subsetTwo = currentSubsets.allMatches[options.subsetsOfSize - 1][j];
              var overlap = subsetOne.filter(function(n) {
                return subsetTwo.indexOf(n) > -1;
              });
              if (overlap.length > options.maxOverlapSize) {
                accept = false;
                overlapNotAcceptable = true;
                break;
              }
            }
            if (overlapNotAcceptable) {
              break;
            }
          }
        }
      }

      if (!accept) {
        continue;
      } else {
        _initAllCombosN(options, sum, setsize, newComboArray); 
      }
    }
  }
}

app.get("/subsets", function(req, res) {
  TOTAL_SUM = req.query.sum ? parseInt(req.query.sum) : DEFAULT_TOTAL_SUM;
  N = req.query.n ? parseInt(req.query.n) : DEFAULT_N;
  var maxOverlapSize = req.query.maxOverlapSize ? parseInt(req.query.maxOverlapSize) : N;
  var minMatchesPerSubset = req.query.minMatchesPerSubset ? parseInt(req.query.minMatchesPerSubset) : 0;
  var subsetsOfSize = req.query.subsetsOfSize ? parseInt(req.query.subsetsOfSize) : null;
  const options = { subsetsOfSize: subsetsOfSize, minMatchesPerSubset: minMatchesPerSubset, maxOverlapSize: maxOverlapSize };

  initAllCombosN(options, TOTAL_SUM, N);

  res.writeHead(200, {"Content-Type":"text/html"});
  res.write("<h1>Sets of size " + N + " summing to " + TOTAL_SUM + "</h1></br>");
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
      if (minMatchesPerSubset === 0 || !subsetsOfSize) {
        res.write("<b style=\"color:red;\">" + (i + 1) + ") " + allcombos[i] + ": NO match</b></br>");
      }
    }
  }
  res.end();
});

app.listen(port, function() {
  console.log("Example app listening on port " + port + "!");
});
