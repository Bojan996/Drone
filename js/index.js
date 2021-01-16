const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//SAFE AREA VARIABLES
let prevSAX = "1";
let prevSAY = "1";
const SAX = document.getElementById("SAX");
const SAY = document.getElementById("SAY");
const safeAreaButton = document.getElementById("safeAreaButton");

//HOME VARIABLES
const homeX = document.getElementById("homeX");
const homeY = document.getElementById("homeY");
const homeButton = document.getElementById("homeButton");

////SAFE TO LAND VARIALES
const SX = document.getElementById("SX");
const SY = document.getElementById("SY");
const safeToLandButtonS = document.getElementById("safeToLandButtonS");
const safeToLandButtonF = document.getElementById("safeToLandButtonF");

//////NO FLY AREA VARIABLES
let prevNFX;
let prevNFY;
const NFX = document.getElementById("NFX");
const NFY = document.getElementById("NFY");
const NFStartPosition = document.getElementById("NFStartPosition");
const noFlyAreaS = document.getElementById("noFlyAreaS");
const noFlyAreaF = document.getElementById("noFlyAreaF");
let firstP = true;
let NFStartingPosition = [];
let NFCoo = [];

//DRONE PATH VARIABLES
let prevDPX;
let prevDPY;
const DPX = document.getElementById("DPX");
const DPY = document.getElementById("DPY");
const pathButton = document.getElementById("pathButton");
const dronePathH = document.getElementById("dronePathP");
let firstDrawDP = true;
let DPStartPosition = [];

//START BTN
const startBtn = document.getElementById("startBtn");

//STATE VARIABLE
const filedState = {
  field: [[50, 50]],
  home: [],
  land: [],
  noFly: [],
  path: [],
};

const logicState = {
  fieldCoo: [],
  fieldCooNoNF: [],
  NFInside: [],
  NFEdges: [],
  NFDrone: [],
};

drawLines();

//SAFE AREA CLICK------------------------------------------------------------
safeAreaButton.addEventListener("click", () => {
  if (rangeCheck(SAX.value, SAY.value)) {
    alert("Out of the field! Try again");
    return;
  }
  if (prevSAX !== SAX.value && prevSAY !== SAY.value) {
    alert("only 90 degree lines allowed! Try again!");
    return;
  }
  makingLine(prevSAX, prevSAY, SAX.value, SAY.value, "#2e8f27");

  filedState.field.push([SAX.value * 50, SAY.value * 50]);
  prevSAX = SAX.value;
  prevSAY = SAY.value;

  if (SAX.value === "1" && SAY.value === "1") {
    alert("Thank you! You made a field, now its time for Home!");
    disable([SAX, SAY, safeAreaButton]);
    enable([homeX, homeY, homeButton]);
    fillColor(filedState.field, "#56e62e");
    drawLines();

    //Updating logic state
    logicState.fieldCoo = allCoo.filter((e) =>
      pointInShape(filedState.field, e)
    );
  }
});

//HOME CLICK------------------------------------------------------------
homeButton.addEventListener("click", () => {
  if (rangeCheck(homeX.value, homeY.value)) {
    alert("Out of the field! Try again");
    return;
  }
  makeCircle(homeX.value, homeY.value, "H");
  disable([homeX, homeY, homeButton]);
  enable([SX, SY, safeToLandButtonS, safeToLandButtonF]);
  filedState.home.push(homeX.value * 50, homeY.value * 50);
  filedState.path.push([homeX.value * 50, homeY.value * 50]);
  dronePathH.innerText = `Path: starts at ${homeX.value} ${homeY.value}`;
  DPX.value = homeX.value;
  DPY.value = homeY.value;
  DPStartPosition = [homeX.value, homeY.value];
});

//SAFE TO LAND INPUT------------------------------------------------------------
safeToLandButtonS.addEventListener("click", () => {
  if (rangeCheck(SX.value, SY.value)) {
    alert("Out of the field! Try again");
    return;
  }
  filedState.land.push([SX.value * 50, SY.value * 50]);
  makeCircle(SX.value, SY.value, "S");
  SX.value = "0";
  SY.value = "0";
});

safeToLandButtonF.addEventListener("click", () => {
  disable([SX, SY, safeToLandButtonS, safeToLandButtonF]);
  enable([NFX, NFY, noFlyAreaS, noFlyAreaF]);
});

//NO FLY AREA CLICK------------------------------------------------------------
noFlyAreaS.addEventListener("click", () => {
  if (rangeCheck(NFX.value, NFY.value)) {
    alert("Out of the field! Try again");
    return;
  }

  if (firstP) {
    NFCoo.push([NFX.value * 50, NFY.value * 50]);
    prevNFX = NFX.value;
    prevNFY = NFY.value;
    NFStartingPosition.push(prevNFX, prevNFY);
    NFStartPosition.innerText = `Start position: ${NFX.value} ${NFY.value}`;
    noFlyAreaF.disabled = true;
    firstP = false;
  } else {
    if (prevNFX !== NFX.value && prevNFY !== NFY.value) {
      alert("only 90 degree lines allowed! Try again!");
      return;
    }
    NFCoo.push([NFX.value * 50, NFY.value * 50]);
    makingLine(prevNFX, prevNFY, NFX.value, NFY.value, "red");
    prevNFX = NFX.value;
    prevNFY = NFY.value;

    if (
      NFX.value === NFStartingPosition[0] &&
      NFY.value === NFStartingPosition[1]
    ) {
      alert(
        "Thank you! You made your No fly area, continue if you want more, click finish if you dont't"
      );
      firstP = true;
      NFX.value = "0";
      NFY.value = "0";
      NFStartPosition.innerText = "Input start position:";
      noFlyAreaF.disabled = false;
      NFStartingPosition = [];

      //logic state update
      //all edge points (including non x50) of the red zone
      let NFAllEdgePoints = getAllPolygonLinePoints(NFCoo);
      logicState.NFEdges.push(NFAllEdgePoints);

      //points inside red zone
      let NFInsidePoints = logicState.fieldCoo.filter((e) =>
        pointInShape(NFCoo, e)
      );
      logicState.NFInside.push(NFInsidePoints);

      //all edge points (is 50x) of the red zone
      let NFAllEdgedronePoints = NFAllEdgePoints.filter(
        ([x, y]) => x % 50 === 0 && y % 50 === 0
      );

      //points that the drone can not stand on (is x50)
      let NFAlldronePoints = cleanArr(
        NFAllEdgedronePoints.concat(NFInsidePoints)
      );
      logicState.NFDrone.push(NFAlldronePoints);

      //Saving all points that the drone can actually stand on (fieldCoo - NFAlldronePoints)
      let allPossibleDronePoints = [];
      for (let i = 0; i < logicState.fieldCoo.length; i++) {
        if (
          NFAlldronePoints.filter((el) => arrEquals(logicState.fieldCoo[i], el))
            .length === 0
        ) {
          allPossibleDronePoints.push(logicState.fieldCoo[i]);
        }
      }
      logicState.fieldCooNoNF.push(allPossibleDronePoints);

      filedState.noFly.push(NFCoo);
      fillColor(NFCoo, "red");
      NFCoo = [];
    }
  }
});

noFlyAreaF.addEventListener("click", () => {
  disable([NFX, NFY, noFlyAreaS, noFlyAreaF]);
  enable([DPX, DPY, pathButton]);
});

//DRONE PATH CLICK------------------------------------------------------------
pathButton.addEventListener("click", () => {
  if (firstDrawDP) {
    prevDPX = DPStartPosition[0];
    prevDPY = DPStartPosition[1];
  }

  if (rangeCheck(DPX.value, DPY.value)) {
    alert("Out of the field! Try again");
    return;
  }

  makingLine(prevDPX, prevDPY, DPX.value, DPY.value, "black", true);
  filedState.path.push([DPX.value * 50, DPY.value * 50]);
  firstDrawDP = false;
  prevDPX = DPX.value;
  prevDPY = DPY.value;

  if (DPX.value == DPStartPosition[0] && DPY.value == DPStartPosition[1]) {
    alert("Thank you! You made the drone path!");
    disable([DPX, DPY, pathButton]);
    enable([startBtn]);
  }
});

startBtn.addEventListener("click", () => {
  let noHome = noRangePoints(filedState.home);
  let noSafe = noRangePoints(filedState.land[0]);
  let allTogether = [];
  for (let i = 0; i < noHome.length; i++) {
    if (noSafe.filter((e) => arrEquals(noHome[i], e)).length !== 0) {
      allTogether.push(noHome[i]);
    }
  }
  bestSafePoint(allTogether);
});

//FUNCTIONS FOR DRONE ALGO

const bestSafePoint = (dangerPoints) => {

  let lines = [];
  for(let i = 0; i<logicState.fieldCooNoNF[0].length; i++){
    for(let j = 0; j<dangerPoints.length; j++){
      lines.push(calcStraightLine(logicState.fieldCooNoNF[0][i], dangerPoints[j]));
    }
  }

  console.log(lines);

  let noDangerLines = [];
  for(let i = 0; i<lines.length; i++){
    let sortArr = [];
    for(let j = 0; j<lines[i].length; j++){
      sortArr.push(searchForArray(logicState.NFEdges[0], lines[i][j]))
    }
    if(sortArr.filter((elem, index, self) => index === self.indexOf(elem)).length === 1){
      noDangerLines.push(lines[i][0]);
    }
  }
  console.log(noDangerLines);
};

const noRangePoints = (goal) => {
  let lines = [];
  for (let i = 0; i < logicState.fieldCooNoNF[0].length; i++) {
    lines.push(calcStraightLine(logicState.fieldCooNoNF[0][i], goal));
  }
  let noHPath = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      if (
        logicState.NFEdges[0].filter((e) => arrEquals(e, lines[i][j]))
          .length !== 0
      ) {
        noHPath.push(lines[i][0]);
      }
    }
  }
  return cleanArr(noHPath);
};

//Funkcija koja omogucava pomocu bresenham-algorithm da izbaci svaku koordinatu za ivice objekta
const getAllPolygonLinePoints = (polygon) => {
  let arr = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    arr.push(calcStraightLine(polygon[i], polygon[i + 1]));
  }
  return arr.flat();
};

const arrEquals = (a, b) => {
  return a.toString() === b.toString();
};

const cleanArr = (arr) => {
  let tmp = [];
  let b = arr.filter((e) => {
    if (tmp.indexOf(e.toString()) < 0) {
      tmp.push(e.toString());
      return e;
    }
  });
  return b;
};

const pointInShape = (polygon, point) => {
  //A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
  let odd = false;
  //For each edge (In this case for each point of the polygon and the previous one)
  for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
    //If a line from the point into infinity crosses this edge
    if (
      polygon[i][1] > point[1] !== polygon[j][1] > point[1] && // One point needs to be above, one below our y coordinate
      // ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
      point[0] <
        ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1])) /
          (polygon[j][1] - polygon[i][1]) +
          polygon[i][0]
    ) {
      // Invert odd
      odd = !odd;
    }
    j = i;
  }
  //If the number of crossings was odd, the point is in the polygon
  return odd;
  //https://www.algorithms-and-technologies.com/point_in_polygon/javascript
  //other solutions on https://www.codewars.com/kata/530265044b7e23379d00076a/solutions/javascript
};

const calcStraightLine = ([x1, y1], [x2, y2]) => {
  //https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
  var coordinatesArray = new Array();
  // Define differences and error check
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);
  var sx = x1 < x2 ? 1 : -1;
  var sy = y1 < y2 ? 1 : -1;
  var err = dx - dy;
  // Set first coordinates
  coordinatesArray.push([x1, y1]);
  // Main loop
  while (!(x1 == x2 && y1 == y2)) {
    var e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
    // Set coordinates
    coordinatesArray.push([x1, y1]);
  }
  // Return the result
  return coordinatesArray;
};

// const hel = calcStraightLine([50,50], [250, 50]);
// console.log(hel);
// for(let i of hel){
//   context.beginPath();
//   context.moveTo(i[0], i[1]);
//   context.lineTo(i[0] +1, i[1] +1);
//   context.lineWidth = 1;
//   context.strokeStyle = "red";
//   context.stroke();
// }


const searchForArray = (haystack, needle) => {
  var i, j, current;
  for(i = 0; i < haystack.length; ++i){
    if(needle.length === haystack[i].length){
      current = haystack[i];
      for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if(j === needle.length)
        return i;
    }
  }
  return -1;
}
