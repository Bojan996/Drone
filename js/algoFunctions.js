//FUNCTIONS FOR DRONE ALGO

//The God Function
const findMostRepeated = (arr) => {
  let mostRepeated = [];
  let x = [...arr];
  while (x.length !== 0) {
    mostRepeated = getMostRepeatedPoint(x.flat());
    x = x.filter((e) => searchForArray(e, mostRepeated) === -1);
    makeCircle(mostRepeated[0] / 50, mostRepeated[1] / 50, "S");
  }
};

//funkcija koja prima arraj od tacaka i vraca koja tacka se najvise ponavlja
const getMostRepeatedPoint = (array) => {
  if (array.length == 0) return null;
  var modeMap = {};
  var maxEl = array[0],
    maxCount = 1;
  for (var i = 0; i < array.length; i++) {
    var el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
};

//Ova funkcija sluzi da nadje sve safe tacke (kada povucem liniju sa danger point, ne pipa crveno) - possible safe points
const getPossibleSafePoints = (dangerPoint) => {
  let lines = [];
  for (let i = 0; i < logicState.fieldCooNoNF[0].length; i++) {
    lines.push(calcStraightLine(logicState.fieldCooNoNF[0][i], dangerPoint));
  }

  let noDangerLines = [];
  for (let i = 0; i < lines.length; i++) {
    let sortArr = [];
    for (let j = 0; j < lines[i].length; j++) {
      sortArr.push(searchForArray(logicState.NFEdges[0], lines[i][j]));
    }
    if (
      sortArr.filter((elem, index, self) => index === self.indexOf(elem))
        .length === 1
    ) {
      noDangerLines.push(lines[i][0]);
    }
  }
  return noDangerLines;
};

//Ova funkcija sluzi da nadje tacke odakle kada bih povukao liniju do 'goal' pipnuo bih crveno - danger tacke
const noRangePoints = (goal) => {
  let lines = [];
  for (let i = 0; i < logicState.fieldCooNoNF[0].length; i++) {
    lines.push(calcStraightLine(logicState.fieldCooNoNF[0][i], goal));
  }

  let noHPath = [];
  for (let i = 0; i < lines.length; i++) {
    let sortArr = [];
    for (let j = 0; j < lines[i].length; j++) {
      sortArr.push(searchForArray(logicState.NFEdges[0], lines[i][j]));
    }
    if (
      sortArr.filter((elem, index, self) => index === self.indexOf(elem))
        .length > 1
    ) {
      noHPath.push(lines[i][0]);
    }
  }

  return noHPath;
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

//sklanja duplikate
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

//funkcija trazi arraj u areju od arejeva :D
const searchForArray = (haystack, needle) => {
  var i, j, current;
  for (i = 0; i < haystack.length; ++i) {
    if (needle.length === haystack[i].length) {
      current = haystack[i];
      for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if (j === needle.length) return i;
    }
  }
  return -1;
};

//Funkcija vraca da li tacka postoji u polygonu ili ne
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

//Funkcija vraca sve tacke izmedju dve kordinate
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
