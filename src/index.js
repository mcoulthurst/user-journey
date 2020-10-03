import * as d3Base from 'd3'
//import * as dsv from 'd3-dsv' // d3 submodule (contains d3.csv, d3.json, etc)
import { textwrap } from 'd3-textwrap';

const d3 = Object.assign(d3Base);
d3.textwrap = textwrap;
const URL = "assets/data/packup.csv";
const margin = { top: 40, right: 80, bottom: 0, left: 0 };
var width = 1200;
var height = 900;
var svg;

var ht_row = 170;
const wd_row = 30;
var wd_full = 1920;
const wd_offset = 330;
const ht_offset = 170;

const ht = 150;
const wd = 160;
const gutter = 10;
const gutterX = 5;
const gutterY = 32;

var row_x;
var row_y;

var offsetX = 2 * wd + gutterX;
var offsetY = 110;

function processData(arr) {
  console.log(arr);
 
  if(arr.length<6 ){
      showError('Not enough Data');
  }else if(arr.length>20 ){
      showError('Too Many Rows');
  }else{
      //drawSidePanel(arr.slice(0,5));
      //drawJourney(arr.slice(5));

      drawJourney(arr);
      drawCurves(arr);
  }

}

function gradient(a, b) { 
  return (b.y-a.y)/(b.x-a.x); 
} 

function bzCurve(points, f, t) { 
  if (typeof(f) == 'undefined') f = 0.3; 
  if (typeof(t) == 'undefined') t = 0.6; 

  ctx.beginPath(); 
  ctx.moveTo(points[0].x, points[0].y); 

  var m = 0; 
  var dx1 = 0; 
  var dy1 = 0; 

  var preP = points[0]; 

  for (var i = 1; i < points.length; i++) { 
      var curP = points[i]; 
      nexP = points[i + 1]; 
      if (nexP) { 
          m = gradient(preP, nexP); 
          dx2 = (nexP.x - curP.x) * -f; 
          dy2 = dx2 * m * t; 
      } else { 
          dx2 = 0; 
          dy2 = 0; 
      } 
        
      ctx.bezierCurveTo( 
          preP.x - dx1, preP.y - dy1, 
          curP.x + dx2, curP.y + dy2, 
          curP.x, curP.y 
      ); 
    
      dx1 = dx2; 
      dy1 = dy2; 
      preP = curP; 
  } 
  ctx.stroke(); 
} 

function drawCurves(arr){
  var lines = [];
  var xPos;
  var yPos;
  var pt;
   for (var i = 0; i < arr.length; i++ ) { 
      yPos = 320 - (arr[i].Emotion*30); 
      xPos = i * 120 + 50;
      pt = [xPos, yPos]; 
      lines.push(pt); 
  }
  // add end point
  yPos = 290;
  xPos =  arr.length * 120 + 50;
  pt = [xPos, yPos]; 
  lines.push(pt); 

  const lineFunction = d3.line().curve(d3.curveCardinal);

  var path = svg.append('path')
    .attr('d', lineFunction(lines))
    .attr("stroke", '#333')
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2 , 5")
    .attr("fill", "none");

    console.log('Append path', path);

}

function drawJourney(arr) {
  const box = {width:120};
  var wrap;
// create a text wrapping function
wrap = d3.textwrap()
    // wrap to 480 x 960 pixels
    .bounds({height: 100, width: 100})
    // wrap with tspans in all browsers
    .method('tspans');

  const g = svg.selectAll('.title')
  .data(arr)
  .enter()
  .append('g')
  //.attr('transform', `translate(${0},${50})`);

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${340})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', '#333')
  .attr('font-size', 20)
  .attr('width', box.width)
  .attr('height', box.width)
  //.attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => d.Tasks)
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${20})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 10)
  .attr('width', box.width)
  .attr('height', box.width)
 // .attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => {
    //var txt = d['Touch points'];
    //txt = txt.split('|').join('\n\n');
    return d['Touch points']
  })
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${380})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 12)
  .attr('width', box.width)
  .attr('height', box.width)
  //.attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => {
    //var txt = d.Notes. split('|').join('\n');
    return d.Notes
  })
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${550})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 12)
  .attr('width', box.width)
  .attr('height', box.width)
  //.attr('font-family', 'Montserrat')
  .attr('font-weight', 200)
  .text((d) => d.Opportunities)
  .attr('text-anchor', 'start');

  // add circles for emotions
  g.append('svg:circle')
  .attr('r', 3)
  .attr('fill', '#000')
  .attr('stroke', '#000')
/* 
  .attr('x', -5)
  .attr('y', -5) */
  .attr('rotation', 90)
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${320 - (d.Emotion*30)}) rotate(45 0 0) `)

  var text = d3.selectAll('text');
  // run the text wrapping function on all text nodes
  text.call(wrap);

}



function initSVG() {
  svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("margin-left", margin.left + "px")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}
function callback(data){
  console.log(data);

}
document.addEventListener("DOMContentLoaded", function () {
  console.log("ready");

  d3.dsv(",", URL, function(d) {
    return d;
  }).then(function(data) {
    console.log(data);
    processData(data);
  });

  initSVG();

});