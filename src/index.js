import * as d3Base from 'd3';
// import * as dsv from 'd3-dsv' // d3 submodule (contains d3.csv, d3.json, etc)
import Canvg from 'canvg';
import FileSaver from 'file-saver';
import { textwrap } from 'd3-textwrap';

const d3 = Object.assign(d3Base);
d3.textwrap = textwrap;
const URL = 'assets/data/packup.csv';
const margin = {
  top: 20, right: 20, bottom: 20, left: 20,
};
const width = 1200;
const svg = d3.select('svg');
const canv = document.querySelector('#canv');
const ctx = canv.getContext('2d');

const box = { width: 120 };

function processData(arr) {
  console.log(arr);

  if (arr.length < 6) {
    // showError('Not enough Data');
  } else if (arr.length > 20) {
    // showError('Too Many Rows');
  } else {
    // drawSidePanel(arr.slice(0,5));
    // drawJourney(arr.slice(5));

    drawJourney(arr);
    drawCurves(arr);
  }
}

function drawCurves(arr) {
  const lines = [];
  let xPos;
  let yPos;
  let pt;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arr.length; i++) {
    yPos = 320 - arr[i].Emotion * 30;
    xPos = i * 120 + 50;
    pt = [xPos, yPos];
    lines.push(pt);
  }

  const lineFunction = d3.line().curve(d3.curveCardinal);
  const g = svg.append('g').attr('id', 'curve');

  const path = g
    .append('path')
    .attr('d', lineFunction(lines))
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2 , 5')
    .attr('fill', 'none');

  g.selectAll('.dots')
    .data(arr)
    .enter()
    // add circles for emotions
    .append('svg:circle')
    .attr('r', 3)
    .attr('fill', '#000')
    .attr('stroke', '#000')
    .attr('rotation', 90)
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${320 - d.Emotion * 30}) rotate(45 0 0) `,
    );

  console.log('Append path', path);
}

function drawJourney(arr) {
  const fill = '#4D4844';
  // create a text wrapping function
  const wrap = d3
    .textwrap()
    .bounds({ height: 100, width: 100 }) // wrap to 480 x 960 pixels
    .method('tspans'); // wrap with tspans in all browsers

  const g = svg.selectAll('.title').data(arr).enter().append('g');

  g.append('text')
    .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${340})`)
    .attr('class', 'title')
    .attr('fill', '#fff')
    .attr('stroke', '#fff')
    .attr('font-size', 18)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 200)
    .text((d) => d.Tasks.toUpperCase())
    .attr('text-anchor', 'start');

  g.append('text')
    .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${20})`)
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 10)
    .attr('y', (d) => {
      let offset = 0;
      if (d.Emotion >= 5) {
        offset = 200;
      }
      return offset;
    })
    .attr('width', box.width)
    .attr('height', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 200)
    .text((d) => d['Touch points'])
    .attr('text-anchor', 'start');

  g.append('text')
    .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${380})`)
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 100)
    .text((d) => d.Notes)
    .attr('text-anchor', 'start');

  g.append('text')
    .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${530})`)
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 200)
    .text((d) => d.Opportunities)
    .attr('text-anchor', 'start');

  const text = d3.selectAll('.block');
  // run the text wrapping function on all text nodes
  text.call(wrap);
}

function initSVG() {
  svg.attr('transform', `translate(${margin.left}, ${margin.top})`);
}

function layout() {
  const fill = '#F5F6F8';

  svg
    .append('svg:rect')
    .attr('height', 310)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', 0);

  svg
    .append('svg:rect')
    .attr('height', 310)
    .attr('width', 20)
    .attr('fill', '#4D4844')
    .attr('x', 0)
    .attr('y', 0);

  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = 160;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'subtitle')
    .attr('fill', '#eee')
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text('Touch points'.toUpperCase());

  svg
    .append('svg:rect')
    .attr('height', 30)
    .attr('width', width)
    .attr('fill', '#32BBB9')
    .attr('x', 0)
    .attr('y', 320);

  svg
    .append('svg:rect')
    .attr('height', 140)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', 360);

  svg
    .append('svg:rect')
    .attr('height', 140)
    .attr('width', 20)
    .attr('fill', '#A7488C')
    .attr('x', 0)
    .attr('y', 360);

  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = 430;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'subtitle')
    .attr('fill', '#eee')
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Montserrat')
    .text('Notes'.toUpperCase());

  svg
    .append('svg:rect')
    .attr('height', 150)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', 510);

  svg
    .append('svg:rect')
    .attr('height', 150)
    .attr('width', 20)
    .attr('fill', '#DFB164')
    .attr('x', 0)
    .attr('y', 510);

  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = 585;
      return `translate(${xText}, ${yText}) rotate(270)`;
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
};

document.addEventListener('DOMContentLoaded', () => {
  const downloadSvgButton = document.querySelector('#download-svg-button');

  downloadSvgButton.addEventListener('click', () => {
    const chart = document.querySelector('#chart');
    const data = chart.outerHTML;
    download('ux.svg', data);
  });

  const downloadPngButton = document.querySelector('#download-png-button');
  downloadPngButton.addEventListener('click', () => {
    canvasSetup();
    canv.toBlob((blob) => {
      FileSaver.saveAs(blob, 'ux.png');
    });
  });

  d3.dsv(',', URL, (d) => {
    console.log();

    return d;
  }).then((data) => {
    console.log(data);
    processData(data);
  });

  initSVG();
  layout();
});
