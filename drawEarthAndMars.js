multiApp.controller("mainController", function($scope) {

  var sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  var clearCanvas = function() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  var drawLine = function(x0, y0, x1, y1) {
    canvasContext.beginPath();

    canvasContext.strokeStyle = "black";

    canvasContext.moveTo((canvas.width/2) + x0, (canvas.height/2) - y0);
    canvasContext.lineTo((canvas.width/2) + x1, (canvas.height/2) - y1);

    canvasContext.stroke();
  }

  var drawDot = function(x, y, radius, color) {
    canvasContext.beginPath();

    canvasContext.strokeStyle = color;
    canvasContext.fillStyle   = color;

    canvasContext.arc((canvas.width/2) + x,
                      (canvas.height/2) - y,
                      radius, 0, 2*Math.PI);

    canvasContext.fill();
    canvasContext.stroke();
  }

  var drawEarth = function(x, y) {
    drawDot(x, y, 8, "blue");
  }

  var drawMars = function(x, y) {
    drawDot(x, y, 5, "red");
  }

  var drawBlackDot = function(x, y) {
    drawDot(x, y, 3, "black");
  }

  var drawSun = function(x, y) {
    drawDot(x, y, 16, "yellow");
  }
  
  var drawLightGenericDot = function(x, y) {
    drawDot(x, y, 2, "lightgray");
  }

  var drawOrbit = function(centerX, centerY, radius) {

    canvasContext.beginPath();
  
    canvasContext.strokeStyle   = "black";
  
    canvasContext.arc((canvas.width/2) + centerX,
                      (canvas.height/2) - centerY,
                      radius, 0, 2*Math.PI);
  
    canvasContext.stroke();
  };

  var drawErrorText = function(drawX, drawY, angleY, angleX, truthAngleStr, totalErrorMagnitude, totalNumRecords) {
    canvasContext.beginPath();

    canvasContext.strokeStyle   = "black";
    canvasContext.font = "18px Arial";

    var angleDeg = Math.atan2(angleY, angleX)*180.0/Math.PI;

    var diffAngle = parseFloat(truthAngleStr) - angleDeg;

    var text = "Current earth-day error:  " + diffAngle.toFixed(2) + " deg";

    canvasContext.strokeText(text,
                             (canvas.width/2) + drawX,
                             (canvas.height/2) - drawY);

    totalErrorMagnitude += Math.abs(diffAngle);

    text = "Total-error-magnitude:  " + totalErrorMagnitude.toFixed(2) + " deg / " + totalNumRecords + " earth-days";

    canvasContext.strokeText(text,
                             (canvas.width/2) + drawX,
                             (canvas.height/2) - drawY + 25);

    return totalErrorMagnitude;
  };

  var drawPtolemaic = function(fields, truthAngle, totalNumRecords) {
    drawEarth(-DRAWING_OFFSET, 0);
    var accumulatedX = -DRAWING_OFFSET;
    var accumulatedY = 0;
    for (var fieldIndex in fields) {
      if (fieldIndex < fields.length-1) {
        var field = fields[fieldIndex];
        var fieldTheta = field.split(",")[0].substring(1);
        var fieldRadius = field.split(",")[1];
        fieldRadius = fieldRadius.substring(0, fieldRadius.length-1);
        var orbitRadius = (maxOrbitDisplayRadius*(fieldRadius/maxPtolemaicOrbitRadius));
        if (orbitRadius < 0) {
            orbitRadius = -orbitRadius;
            if (fieldTheta < 0) {
                fieldTheta += Math.PI;
            }
            else {
                fieldTheta -= Math.PI;
            }
        }
        var x = Math.cos(fieldTheta)*orbitRadius;
        var y = Math.sin(fieldTheta)*orbitRadius;
        drawOrbit(accumulatedX, accumulatedY, orbitRadius);
        if (fieldIndex == fields.length-2) {
          drawLine(-DRAWING_OFFSET, 0, accumulatedX + x, accumulatedY + y);
          drawMars(accumulatedX + x, accumulatedY + y);
          totalPtolemaicError = drawErrorText(-DRAWING_OFFSET-TEXT_OFFSET_X, -TEXT_OFFSET_Y, accumulatedY + y, DRAWING_OFFSET + accumulatedX + x, truthAngle, totalPtolemaicError, totalNumRecords);
        }
        else {
          drawBlackDot(accumulatedX + x, accumulatedY + y);
        }
  
        accumulatedX += x;
        accumulatedY += y;
      }
    }
  }
  
  var drawKeplerian = function(fields, truthAngle, totalNumRecords) {
    var earthX = fields[0].split(",")[0].substring(1);
    var earthY = fields[0].split(",")[1];
    var marsX = fields[1].split(",")[0].substring(1);
    var marsY = fields[1].split(",")[1];

    earthX = maxOrbitDisplayRadius*(earthX/maxKeplerianOrbitRadius);
    earthY = maxOrbitDisplayRadius*(earthY/maxKeplerianOrbitRadius);
    marsX = maxOrbitDisplayRadius*(marsX/maxKeplerianOrbitRadius);
    marsY = maxOrbitDisplayRadius*(marsY/maxKeplerianOrbitRadius);

    drawSun(0 + DRAWING_OFFSET, 0);
    drawEarth(earthX + DRAWING_OFFSET, earthY);
    drawLine(earthX + DRAWING_OFFSET, earthY, marsX + DRAWING_OFFSET, marsY);
    drawMars(marsX + DRAWING_OFFSET, marsY);

    totalKeplerianError = drawErrorText(DRAWING_OFFSET-TEXT_OFFSET_X, -TEXT_OFFSET_Y, marsY - earthY, marsX - earthX, truthAngle, totalKeplerianError, totalNumRecords);
  }
  
  var clearKeplerian = function(fields) {
    var earthX = fields[0].split(",")[0].substring(1);
    var earthY = fields[0].split(",")[1];
    var marsX = fields[1].split(",")[0].substring(1);
    var marsY = fields[1].split(",")[1];

    earthX = maxOrbitDisplayRadius*(earthX/maxKeplerianOrbitRadius);
    earthY = maxOrbitDisplayRadius*(earthY/maxKeplerianOrbitRadius);
    marsX = maxOrbitDisplayRadius*(marsX/maxKeplerianOrbitRadius);
    marsY = maxOrbitDisplayRadius*(marsY/maxKeplerianOrbitRadius);

    drawLightGenericDot(earthX + DRAWING_OFFSET, earthY);
    drawLightGenericDot(marsX + DRAWING_OFFSET, marsY);
  }
 
  var drawKeplerianOrbits = function(lines) {
    for (var index in lines) {
      if (index < lines.length-1) {
        var line = lines[index];
        var fields = line.split(";");
        clearKeplerian(fields.slice(4,6));
      }
    }
  }
 
  var canvas                = document.getElementById("myCanvas");
  var canvasContext         = canvas.getContext("2d");
  var canvasAspectRatio     = 1/1;
  var maxOrbitDisplayRadius = 100;
  var maxPtolemaicOrbitRadius      = 7.546760e+31;
  var maxKeplerianOrbitRadius      = 1.75e+11;
  var ANIMATION_FRAME_PERIOD_MSECS = 20;
  var DRAWING_OFFSET        = canvas.width/5;
  var TEXT_OFFSET_X         = 185;
  var TEXT_OFFSET_Y         = 225;
  var totalPtolemaicError   = 0.0;
  var totalKeplerianError   = 0.0;

  document.getElementById('inputfile') 
             .addEventListener('input', function() { 

    var reader = new FileReader();
  
    reader.onload = (function(reader)
    {
      totalPtolemaicError = 0.0;
      totalKeplerianError = 0.0;

      clearCanvas();

      return async function() {
        var contents = reader.result;

        var lines = contents.split('\n');

        for (var index in lines) {
          if (index < lines.length-1) {
            var line = lines[index];
            var fields = line.split(";");
            var truthAngleStr = fields.slice(6).toString();
            clearCanvas();
            drawPtolemaic(fields.slice(0,4), truthAngleStr, lines.length-1);
            drawKeplerianOrbits(lines);
            drawKeplerian(fields.slice(4,6), truthAngleStr, lines.length-1);

            await sleep(ANIMATION_FRAME_PERIOD_MSECS);
          }
        }
      }
    })(reader);

    reader.readAsText(this.files[0]);

  });

});
