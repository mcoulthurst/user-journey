import * as d3Base from 'd3'
//import * as dsv from 'd3-dsv' // d3 submodule (contains d3.csv, d3.json, etc)
import { textwrap } from 'd3-textwrap';

const d3 = Object.assign(d3Base);
d3.textwrap = textwrap;
const URL = "assets/data/user.csv";
const margin = { top: 40, right: 80, bottom: 0, left: 0 };
var width = 1000;
var height = 700;
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

      drawJourney(arr.slice(5));
  }

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
  .attr('transform', `translate(${0},${50})`);

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, -${20})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', '#333')
  .attr('font-size', 14)
  .attr('width', box.width)
  .attr('height', box.width)
  //.attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => d.Tasks)
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${150})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', '#333')
  .attr('font-size', 14)
  .attr('width', box.width)
  .attr('height', box.width)
 // .attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => d['Touch points'])
  .attr('text-anchor', 'start');

  g.append('text')
  .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${250})`)
  .attr('class', 'title')
  .attr('fill', '#333')
  .attr('stroke', '#333')
  .attr('font-size', 14)
  .attr('width', box.width)
  .attr('height', box.width)
  //.attr('font-family', 'Montserrat')
  .attr('font-weight',100)
  .text((d) => d['Pain points'])
  .attr('text-anchor', 'start');

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