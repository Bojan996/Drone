//FUNCTIONS FOR DRAWING

const rangeCheck = (x, y) => {
    return x * 50 > 1000 || y * 50 > 700;
  };
  
  const makingLine = (prevX, prevY, currentX, currentY, color, path) => {
    context.beginPath();
    if (path) context.setLineDash([10, 10]);
    context.moveTo(prevX * 50, prevY * 50);
    context.lineTo(currentX * 50, currentY * 50);
    context.strokeStyle = color;
    context.stroke();
  };
  
  const makeCircle = (x, y, letter) => {
    context.beginPath();
    context.fillStyle = "white";
    context.arc(x * 50, y * 50, 25, 0, 2 * Math.PI, false);
    context.fill();
    context.font = "20pt Calibri";
    context.beginPath();
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText(letter, x * 50, y * 50 + 7.5);
    context.fill();
  };
  
  const fillColor = (coo, color) => {
    context.beginPath();
    context.moveTo(coo[0][0], coo[0][1]);
    for (i of coo) {
      context.lineTo(i[0], i[1]);
    }
    context.fillStyle = color;
    context.fill();
  };
  
  const enable = (arr) => {
    for (i of arr) {
      i.disabled = false;
    }
  };
  
  const disable = (arr) => {
    for (i of arr) {
      i.disabled = true;
    }
  };
  
  const drawLines = () => {
    for (let i = 0; i <= 700; i += 50) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(1000, i);
      context.lineWidth = 1;
      context.strokeStyle = "#a8a8a8";
      context.stroke();
    }
  
    for (let i = 0; i <= 1000; i += 50) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, 700);
      context.lineWidth = 1;
      context.strokeStyle = "#a8a8a8";
      context.stroke();
    }
  };