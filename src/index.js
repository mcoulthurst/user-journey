import * as d3Base from 'd3'

const d3 = Object.assign(d3Base, { })
const URL = "assets/data/user.csv";
const margin = { top: 40, right: 80, bottom: 0, left: 0 };
var width = 1000;
var height = 700;
var svg;

function processData(data) {
  console.log(data);

  if(arr.length<6 ){
      showError('Not enough Data');
  }else if(arr.length>20 ){
      showError('Too Many Rows');
  }else{
      drawSidePanel(arr.slice(0,5), selection);

      drawJourney(arr.slice(5), selection);
  }
}

function draw() {
  svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("margin-left", margin.left + "px")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}


document.addEventListener("DOMContentLoaded", function () {
  console.log("ready");
  // load data
  d3.csv(URL, function(data){
    console.log(data)
});

/* 
  d3.csv(URL, function (data) {
    
    console.log(data);
    
    var dataX = d3.csvParseRows(data, function(d, i) {
      console.log(d);
      return {
         year: new Date(+d[0], 0, 1), // convert first colum column to Date
        make: d[1],
        model: d[2],
        length: +d[3] // convert fourth column to number 
      };
    });
    console.log(dataX);

    processData(data);
    draw();
  }); 

 */
});