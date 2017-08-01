var sensorTypes = ['temp', 'hum', 'wt', 'bee'];
var units = [' \u00b0C', ' %', ' kg', ''];
var dataTemp = [],
  dataHum = [],
  dataWt = [],
  dataBee = [];
var sensorData = [dataTemp, dataHum, dataWt, dataBee];
var xVals = [0,0,0,0];

var charts = [];
var indicateColors = ['#9a1919', '#9a5c19', '#9a8619', '#899a19', '#469a19'];

for(var i=0; i<4; i++){
  c = new CanvasJS.Chart("chart"+sensorTypes[i],{    
    backgroundColor: "#8b8b8b",
    axisX: {lineColor:"black", tickColor:"black", tickThickness: 1, lineThickness: 1, labelFontColor:"black", labelFontFamily: 'verdana'},
    axisY: {lineColor:"black", tickColor:"black", tickThickness: 1, lineThickness: 1, labelFontColor:"black", labelFontFamily: 'verdana'},
    toolTip:{backgroundColor: "#8b8b8b"},
    data: [{
      type: "line",
      lineColor: '#f9c700',
      color:'#f9c700',
      markerSize: 10,
      dataPoints: sensorData[i]
    }]
  });
  charts.push(c)
};

if (!!window.EventSource) {
  var source = new EventSource('/stream');
  source.addEventListener('message', function(e) {
    newData = JSON.parse(e.data);
    s = newData.toUpdate;
    if (s!= 'settings') {
      updateChart(newData, s);
    } else {
      updatePrefs(newData)
    };
    if (newData.tPref != 0) {
      var hTemp = 1 - (Math.abs(newData.temp.avg - newData.tPref) / newData.tPref),
        hHum = 1 - (Math.abs(newData.hum.avg - newData.hPref) / newData.hPref),
        hWt = 1 - (Math.abs(newData.wt.avg - newData.wPref) / newData.wPref),
        hBee = 1 - (Math.abs(newData.bee.avg - newData.bPref) / newData.bPref)
      var hiveHealth = ((hTemp + hHum + hWt + hBee) / 4) * 100;
      var colorIndex = Math.round(hiveHealth/25);
      $("#indicator").text(hiveHealth+' '+colorIndex);
      $('#healthIndicator').css('background-color', indicateColors[colorIndex])
    };
  }, false);

  source.addEventListener('open', function(e) {
    $(".state").text("(Connected)")
  }, false);

  source.addEventListener('error', function(e) {
    console.log(e);
    if (e.target.readyState == EventSource.CLOSED) {
      $(".state").text("(Disconnected)")
    }
    else if (e.target.readyState == EventSource.CONNECTING) {
      $(".state").text("(Connecting...)")
    }
  }, false)
} else {
  console.log("Your browser doesn't support SSE")
};


var updateChart = function (data, s) {
  if(s != null) {
    i = sensorTypes.indexOf(s);
    var avg = data[s].avg;
    console.log(s+' avg (last 50 dps): '+avg);
    $('.avg'+i).text(avg+units[i])
    y = data[s].dps[data[s].dps.length - 1];
    chart = sensorData[i];
    chart.push({
      x: xVals[i],
      y: y
    });
    if (chart.length > 10) {
      chart.shift()
    };
    xVals[i]++;
    charts[i].render();
  };
};

var updatePrefs = function(data) {
  $('.tempPref').text(data.tPref+' \u00b0C');
  $('.humPref').text(data.hPref+' %');
  $('.wtPref').text(data.wPref+' kg');
  $('.beePref').text(data.bPref);
}