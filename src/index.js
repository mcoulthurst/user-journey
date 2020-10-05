import * as d3Base from 'd3'
//import * as dsv from 'd3-dsv' // d3 submodule (contains d3.csv, d3.json, etc)
import Canvg from 'canvg';
import FileSaver from 'file-saver';
import { textwrap } from 'd3-textwrap';

const d3 = Object.assign(d3Base);
d3.textwrap = textwrap;
const URL = "assets/data/packup.csv";
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
let width = 1200;
let height = 900;
const svg = d3.select('svg');
const canv = document.querySelector("#canv");
const ctx = canv.getContext("2d");

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
const box = {width:120};

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
/*   yPos = 320 - (arr[arr.length-1].Emotion*30); 
  xPos =  arr.length * 120 + 50;
  pt = [xPos, yPos]; 
  lines.push(pt);  */

  const lineFunction = d3.line().curve(d3.curveCardinal);

  const g = svg.append('g')
    .attr('id', 'curve');

  var path = g.append('path')
    .attr('d', lineFunction(lines))
    .attr("stroke", '#333')
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2 , 5")
    .attr("fill", "none");

  g.selectAll('.dots')
    .data(arr)
    .enter()
  // add circles for emotions
  .append('svg:circle')
  .attr('r', 3)
  .attr('fill', '#000')
  .attr('stroke', '#000')
/* 
  .attr('x', -5)
  .attr('y', -5) */
  .attr('rotation', 90)
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${320 - (d.Emotion*30)}) rotate(45 0 0) `)

    console.log('Append path', path);

}

function drawJourney(arr) {

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
  .attr('fill', '#fff')
  .attr('stroke', '#fff')
  .attr('font-size', 18)
  .attr('width', box.width)
  //.attr('height', box.width)
  .attr('font-family', 'Montserrat')
  .attr('font-weight', 200)
  .text((d) => d.Tasks.toUpperCase())
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${20})`)
  .attr('class', 'block')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 10)
  .attr('y', (d) => {
    let offset =0;
    if( d.Emotion>=5 ){
      offset = 200;
    }
    return offset
  })
  .attr('width', box.width)
  .attr('height', box.width)
  .attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => {
    //var txt = d['Touch points'];
    //txt = txt.split('|').join('\n\n');
    return d['Touch points']
  })
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${380})`)
  .attr('class', 'block')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 12)
  .attr('width', box.width)
  //.attr('height', box.width)
  .attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => {
    //var txt = d.Notes. split('|').join('\n');
    return d.Notes
  })
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${530})`)
  .attr('class', 'block')
  .attr('fill', '#333')
  .attr('stroke', 'none')
  .attr('font-size', 12)
  .attr('width', box.width)
  //.attr('height', box.width)
  .attr('font-family', 'Montserrat')
  .attr('font-weight', 200)
  .text((d) => d.Opportunities)
  .attr('text-anchor', 'start');


  var text = d3.selectAll('.block');
  // run the text wrapping function on all text nodes
  text.call(wrap);
}

function initSVG() {
  /* 
  svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("margin-left", margin.left + "px")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 */
  svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function layout(){
  const fill = '#e3e3e3';

  svg.append('svg:rect')
    .attr('height', 310)
    .attr('width', width)
    .attr('fill', '#e3e3e3')
    .attr('x', 0)
    .attr('y', 0);

  svg.append('svg:rect')
    .attr('height', 310)
    .attr('width', 20)
    .attr('fill', '#4D4844')
    .attr('x', 0)
    .attr('y', 0);

  svg.append('text')
    .attr("transform", function(d,i){
      var xText = 15;//i * (w / data.length);
      var yText = 160;//h - yScale(d.v);
      return "translate(" + xText + "," + yText + ") rotate(270)";
    })
    .attr('class', 'subtitle')
    .attr('fill', '#eee')
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text('Touch points'.toUpperCase());

  svg.append('svg:rect')
    .attr('height', 30)
    .attr('width', width)
    .attr('fill', '#32BBB9')
    .attr('x', 0)
    .attr('y', 320);

  svg.append('svg:rect')
    .attr('height', 140)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', 360);

  svg.append('svg:rect')
    .attr('height', 140)
    .attr('width', 20)
    .attr('fill', '#A7488C')
    .attr('x', 0)
    .attr('y', 360);

    svg.append('text')
    .attr("transform", function(d,i){
      var xText = 15;
      var yText = 430;
      return "translate(" + xText + "," + yText + ") rotate(270)";
    })
    .attr('class', 'subtitle')
    .attr('fill', '#eee')
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Montserrat')
    .text('Notes'.toUpperCase());

  svg.append('svg:rect')
    .attr('height', 150)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x',0)
    .attr('y', 510);

  svg.append('svg:rect')
    .attr('height', 150)
    .attr('width', 20)
    .attr('fill', '#DFB164')
    .attr('x',0)
    .attr('y', 510);

    svg.append('text')
    .attr("transform", function(d,i){
      var xText = 15;
      var yText = 585;
      return "translate(" + xText + "," + yText + ") rotate(270)";
    })
    .attr('class', 'subtitle')
    .attr('fill', '#333')
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text('Opportunities'.toUpperCase());

    
  console.log('layout');
}

function callback(data){
  console.log(data);
}

function download(filename, text) {
  const pom = document.createElement('a');
  pom.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    const event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}

const canvasSetup = () => {
  const chart = document.querySelector('#chart');
  const data = chart.outerHTML;
  
  const v = Canvg.fromString(ctx, data);
  v.start();
}


document.addEventListener("DOMContentLoaded", function () {
  console.log("ready");

  const downloadSvgButton = document.querySelector('#download-svg-button');
  console.log(downloadSvgButton);

  downloadSvgButton.addEventListener('click', () => {
    const chart = document.querySelector('#chart');
    const data = chart.outerHTML;
    console.log(data);
    download(`ux.svg`, data);
  });

  const downloadPngButton = document.querySelector("#download-png-button");
  downloadPngButton.addEventListener("click", () => {
    canvasSetup();
    canv.toBlob(function (blob) {
      FileSaver.saveAs(blob, "ux.png");
    });
  });

  d3.dsv(",", URL, function(d) {
    return d;
  }).then(function(data) {
    console.log(data);
    processData(data);
  });

  initSVG();
  layout();

});