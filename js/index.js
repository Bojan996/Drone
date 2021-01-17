const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const loader = document.getElementById("loaderContainer");

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
  path: [],
};

const logicState = {
  fieldCoo: [],
  fieldCooEdges: [],
  fieldCooNoNF: [],
  NFEdges: [],
  dangerPointsToHome: null,
  dangerPointsToSafe: null
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
    //getting all edge points of filed, so that drone doesn't cross in gray zone, but get rid of drone standing points
    // let allEdges = getAllPolygonLinePoints(filedState.field);
    // let allEdgesNoDronePoints = [];
    // for (let i = 0; i < allEdges.length; i++) {
    //   if (allEdges[i][0] % 50 !== 0 && allEdges[i][1] !== 0) {
    //     allEdgesNoDronePoints.push(allEdges[i]);
    //   }
    // }
    // logicState.fieldCooEdges.push(allEdgesNoDronePoints);
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

    if (NFX.value === NFStartingPosition[0] && NFY.value === NFStartingPosition[1]) {
      alert("Thank you! You made your No fly area, continue if you want more, click finish if you dont't");
      firstP = true;
      NFX.value = "0";
      NFY.value = "0";
      NFStartPosition.innerText = "Input start position:";
      noFlyAreaF.disabled = false;
      NFStartingPosition = [];

      //LOGIC STATE UPDATE
      //all edge points (including non x50) of the red zone
      let NFAllEdgePoints = getAllPolygonLinePoints(NFCoo);
      logicState.NFEdges.push(NFAllEdgePoints);

      //points inside red zone
      let NFInsidePoints = logicState.fieldCoo.filter((e) =>
        pointInShape(NFCoo, e)
      );

      //all edge points (is 50x) of the red zone
      let NFAllEdgedronePoints = NFAllEdgePoints.filter(
        ([x, y]) => x % 50 === 0 && y % 50 === 0
      );

      //points that the drone can not stand on (is x50)
      let NFAlldronePoints = cleanArr(
        NFAllEdgedronePoints.concat(NFInsidePoints)
      );

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

      logicState.dangerPointsToHome = noRangePoints([homeX.value, homeY.value]);
      logicState.dangerPointsToSafe = filedState.land.map((e) => noRangePoints(e));
      //END OF LOGIC STATE UPDATE

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


//START BUTTON CLICK------------------------------------------------------------
startBtn.addEventListener("click", () => {
  let sharedDangerPoints = [];
  for (let i = 0; i < logicState.dangerPointsToHome.length; i++) {
    if (logicState.dangerPointsToSafe.flat().filter((e) => arrEquals(logicState.dangerPointsToHome[i], e)).length !== 0) {
      sharedDangerPoints.push(logicState.dangerPointsToHome[i]);
    }
  }

  let possibleSafePoints = [];
  for (let i = 0; i < sharedDangerPoints.length; i++) {
    possibleSafePoints.push(getPossibleSafePoints(sharedDangerPoints[i]));
  }
  findMostRepeated(possibleSafePoints);
});
