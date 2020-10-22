import * as d3Base from 'd3';
// import * as dsv from 'd3-dsv' // d3 submodule (contains d3.csv, d3.json, etc)
import Canvg from 'canvg';
import FileSaver from 'file-saver';
import { textwrap } from 'd3-textwrap';

const d3 = Object.assign(d3Base);
d3.textwrap = textwrap;
// const URL = 'assets/data/test_shortened.csv';
const URL = 'assets/data/transposed.csv';
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
let width = 1200;
let height = 800;
const offset = 90;
const columnWidth = 120;
let yPos = 0;
let scoreNoteIndex = 0;
let subtitlesIndex = 0;
let pageTitle = '';

const svg = d3.select('svg');
const canv = document.querySelector('#canv');
const ctx = canv.getContext('2d');

const box = { width: 120 };
let titles = [];
let subtitles = [];
let row = [];

let colorScheme = ['#2C5B89', '#4D4844', '#2C5B89', '#2393CF', '#3A81BA'];
const textLight = '#FFFFFF';
const textDark = '#4D4844';
const bgGrey = '#F5F6F8';
const gutter = 10;

function drawCurves(arr) {
  const lines = [];
  let xPos;
  let yPos;
  let pt;

  const data = arr[scoreNoteIndex].scores;
  console.log(data);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < data.length; i++) {
    yPos = offset + 320 - data[i] * 3; // use the 'emotion' value contained in column 2
    xPos = i * 120 + 50;
    pt = [xPos, yPos];
    lines.push(pt);
  }

  const lineFunction = d3.line().curve(d3.curveCardinal);
  const g = svg.append('g').attr('id', 'curve');

  g.selectAll('.notes')
    .data(data)
    .enter()
    .append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${gutter * 2})`,
    )
    .attr('id', (d, i) => `notes_${i + 1}`)
    .attr('class', 'block')
    .attr('fill', textDark)
    .attr('stroke', 'none')
    .attr('font-size', 10)
    .attr('y', (d) => {
      let textOffset = 0;
      if (d >= 50) {
        textOffset = 200;
      }
      return textOffset;
    })
    .attr('width', box.width)
    .attr('height', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d)
    .attr('text-anchor', 'start');

  g.append('path')
    .attr('d', lineFunction(lines))
    .attr('stroke', textDark)
    .attr('class', 'path')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2 , 5')
    .attr('fill', 'none');

  const node = g.selectAll('.dots')
    .data(data)
    .enter();

  // add circles for emotions
  node.append('svg:circle')
    .attr('class', 'dots')
    .attr('r', 3)
    .attr('fill', textDark)
    .attr('stroke', textDark)
    .attr(
      'transform', (d, i) => `translate(${i * box.width + 50}, ${offset + 320 - d * 3})`,
    );
  // add line for links to notes
  node.append('svg:line')
    .attr('class', 'lines')
    .attr('y1', (d, i) => {
       const textBlock = document.querySelector(`#notes_${i}`);
      // const textBlock = d3.selectAll(`.notes_${i}`);
      let textOffset = 200;
      if (textBlock.children.length > 1) {
        textOffset = offset + (textBlock.children.length - 1) * 10 + 26;
      } else if (textBlock.children.length === 1) {
        textOffset = offset + 320 - d * 3;
      }
      if (d >= 50) {
        textOffset = offset + 320 - d * 3;
      }
      return textOffset;
    })
    .attr('y2', (d) => {
      let textOffset = offset + 320 - d * 3;
      if (d >= 50) { // TODO catch nodes without text (set y1 and y2 the same so no line is drawn)
        textOffset = offset + 204;
      }
      return textOffset;
    })
    .attr('x1', (d, i) => (i * box.width + 50))
    .attr('x2', (d, i) => (i * box.width + 50))
    .attr('stroke-width', 0.5)
    .attr('stroke-opacity', 0.5)
    .attr('stroke', textDark);
}

function getHeight(str) {
  const baseHt = 150;
  let ht = baseHt;
  if (str === 'V1.1') {
    ht = 80;
  }
  if (str === 'SCORE') {
    ht = 320;
  }
  if (str === 'TITLE_BLOCK') {
    ht = 30;
  }
  return ht;
}

function drawRow(arr) {
  const fill = bgGrey;
  // create a text wrapping function
  const wrap = d3
    .textwrap()
    .bounds({ height: 100, width: 100 }) // wrap to 480 x 960 pixels
    .method('tspans'); // wrap with tspans in all browsers

  const g = svg.selectAll('.title')
    .data(arr)
    .enter()
    .append('g')
    .attr('class', (d, i) => `row_${i} rows`)
    .attr('transform', (d) => `translate(0, ${d.yPos})`);

  g.append('svg:rect')
    .attr('height', (d) => d.ht)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', 0);

  g.append('svg:rect')
    .attr('height', (d) => d.ht)
    .attr('width', (d) => {
      let wd = 20;
      if (d.title === 'V1.1' || d.title === 'TITLE_BLOCK') {
        wd = width;
      }
      return wd;
    })
    .attr('fill', (d) => d.color)
    .attr('x', 0)
    .attr('y', 0);

  g.selectAll('.notes')
    .data((d) => d.notes)
    .enter()
    .append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${gutter * 2})`,
    )
    .attr('id', (d, i) => `notes_${i + 1}`)
    .attr('class', 'block')
    .attr('fill', textDark)
    .attr('stroke', 'none')
    .attr('font-size', 10)
    .attr('y', (d) => {
      let textOffset = 0;
      if (d[2] >= 50) {
        textOffset = 200;
      }
      return textOffset;
    })
    .attr('width', box.width)
    .attr('height', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d)
    .attr('text-anchor', 'start');

  const text = d3.selectAll('.block');
  // run the text wrapping function on all text nodes
  text.call(wrap);

  // STAGE SUBTITLE
  svg.select(`.row_${subtitlesIndex}`)
    .selectAll('.subtitles')
    .data(subtitles)
    .enter()
    .append('text')
    .attr('transform', (d, i) => `translate(${i * box.width + 50}, ${20})`)
    .attr('class', 'subtitle')
    .attr('fill', textLight)
    .attr('stroke', textLight)
    .attr('font-size', 18)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d.toUpperCase())
    .attr('text-anchor', 'start');

  // ROW SUBTITLE
  svg.selectAll('.rowtitles')
    .data(arr)
    .enter()
    .append('text')
    .attr('transform', (d) => {
      const xText = 15;
      const yText = d.yPos + d.ht / 2;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'rowtitles')
    .attr('fill', textLight)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text((d) => {
      let res = d.title.toUpperCase();
      // TODO - dont create node for the missing row titles
      if (res === 'TITLE_BLOCK' || res === 'V1.1') {
        res = '';
      }
      return res;
    });

  // page title
  svg.select('.row_0')
    .append('text')
    .attr('transform', () => `translate(${40}, ${50})`)
    .attr('class', 'title')
    .attr('fill', textLight)
    .attr('stroke', textLight)
    .attr('font-size', 32)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 200)
    .text(pageTitle.toUpperCase())
    .attr('text-anchor', 'start');
}

function drawTextBlocks(arr) {
  const fill = textDark;
  // create a text wrapping function
  const wrap = d3
    .textwrap()
    .bounds({ height: 100, width: 100 }) // wrap to 480 x 960 pixels
    .method('tspans'); // wrap with tspans in all browsers

  const g = svg.selectAll('.title').data(arr).enter().append('g');

  // TITLE
  g.append('text')
    .attr('transform', () => `translate(${40}, ${50})`)
    .attr('class', 'title')
    .attr('fill', textLight)
    .attr('stroke', textLight)
    .attr('font-size', 32)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 200)
    .text((d) => d[0].toUpperCase())
    .attr('text-anchor', 'start');

  // TASKS
  g.append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${offset + 341})`,
    )
    .attr('class', 'title')
    .attr('fill', textLight)
    .attr('stroke', textLight)
    .attr('font-size', 18)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d[1].toUpperCase())
    .attr('text-anchor', 'start');

  // TOUCH POINTS
  g.append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${offset + 20})`,
    )
    .attr('id', (d, i) => `notes_${i}`)
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 10)
    .attr('y', (d) => {
      let textOffset = 0;
      if (d[2] >= 50) {
        textOffset = 200;
      }
      return textOffset;
    })
    .attr('width', box.width)
    .attr('height', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d[3])
    .attr('text-anchor', 'start');

  // NOTES
  g.append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${offset + 380})`,
    )
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d[4])
    .attr('text-anchor', 'start');

  // OPPORTUNITES
  g.append('text')
    .attr(
      'transform',
      (d, i) => `translate(${i * box.width + 50}, ${offset + 540})`,
    )
    .attr('class', 'block')
    .attr('fill', fill)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('width', box.width)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 'normal')
    .text((d) => d[5])
    .attr('text-anchor', 'start');

  const text = d3.selectAll('.block');
  // run the text wrapping function on all text nodes
  text.call(wrap);
}

function initSVG() {
  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // also set canvas width for png
  d3.select('#canv').attr('width', width).attr('height', height);
}

function clearSVG() {
  svg.selectAll('text').remove();
  svg.selectAll('block').remove();

  svg.selectAll('.rows').remove();
  svg.selectAll('.path').remove();
  svg.selectAll('.lines').remove();
  svg.selectAll('.dots').remove();
}
/* 
function layout() {
  const fill = bgGrey;
  const gutter = 10;
  let rowHt = 80;
  let yPos = 0;

  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', width)
    .attr('fill', colorScheme[0])
    .attr('x', 0)
    .attr('y', yPos);

  yPos += rowHt + gutter;
  rowHt = 310;
  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', yPos);

  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', 20)
    .attr('fill', colorScheme[1])
    .attr('x', 0)
    .attr('y', yPos);

  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = yPos + rowHt / 2;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'subtitle')
    .attr('fill', textLight)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text(titles[3].toUpperCase());

  yPos += rowHt + gutter;
  rowHt = 30;
  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', width)
    .attr('fill', colorScheme[2])
    .attr('x', 0)
    .attr('y', yPos);

  yPos += rowHt + gutter;
  rowHt = 150;
  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', yPos);
  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', 20)
    .attr('fill', colorScheme[3])
    .attr('x', 0)
    .attr('y', yPos);
  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = yPos + rowHt / 2;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'subtitle')
    .attr('fill', textLight)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Montserrat')
    .text(titles[4].toUpperCase());

  yPos += rowHt + gutter;
  rowHt = 150;
  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', width)
    .attr('fill', fill)
    .attr('x', 0)
    .attr('y', yPos);

  svg
    .append('svg:rect')
    .attr('height', rowHt)
    .attr('width', 20)
    .attr('fill', colorScheme[4])
    .attr('x', 0)
    .attr('y', yPos);

  svg
    .append('text')
    .attr('transform', () => {
      const xText = 15;
      const yText = yPos + rowHt / 2;
      return `translate(${xText}, ${yText}) rotate(270)`;
    })
    .attr('class', 'subtitle')
    .attr('fill', textLight)
    .attr('stroke', 'none')
    .attr('font-size', 12)
    .attr('font-family', 'Montserrat')
    .attr('font-weight', 400)
    .attr('text-anchor', 'middle')
    .text(titles[5].toUpperCase());
}
 */
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

function transposeCSV(arr) {
  const len = arr.length;
  let i = 0;
  titles = [];
  row = [];
  colorScheme = [];
  let yPos = 0;

  // eslint-disable-next-line no-plusplus
  for (i = 0; i < len; i++) {
    const rowObj = {};
    // loop thru and create row objects
    const ht = getHeight(arr[i][0]);
    // when we find the scores create new object and add the notes to it
    if (arr[i][0] === 'SCORE') {
      rowObj.scores = arr[i].slice(2);
      scoreNoteIndex = i;
      i++;
    }
    rowObj.title = arr[i][0];
    rowObj.color = arr[i][1];
    rowObj.ht = ht;
    rowObj.yPos = yPos;
    yPos += ht + gutter;
    if (arr[i][0] === 'TITLE_BLOCK') {
      subtitles = arr[i].slice(2);
      subtitlesIndex = row.length;
    }
    rowObj.notes = arr[i].slice(2);

    if (arr[i][0] === 'V1.1') {
      pageTitle = arr[i][2];
      rowObj.notes = [];
    }
    //reset the notes for score
    if (arr[i][0] === 'SCORE') {
      rowObj.notes = [];
    }
    row.push(rowObj);
  }

  console.log(row);
  return row;
}

function processData(txt) {
  let arr = d3.csvParseRows(txt);

  // check for cell orientation in csv
  if (arr[0][0] === 'V1.1') {
    console.log('transposed');
    arr = transposeCSV(arr);
    width = arr[1].notes.length * columnWidth;
    height = arr.length * 300;
  } else {
    console.log('original');
    // get first row for field titles
    titles = arr.shift();
    width = arr.length * columnWidth;
  }
  console.log(`----- ${width} ----`);
  console.log(arr);

  initSVG();
  clearSVG();

  drawRow(arr);
  drawCurves(arr);
}

const canvasSetup = () => {
  const chart = document.querySelector('#chart');
  const data = chart.outerHTML;

  const v = Canvg.fromString(ctx, data);
  v.start();
};

function handleFileSelect(evt) {
  const file = evt.target.files[0];

  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = e.target.result;
    processData(csv);
  };

  // Read in the file data as text string.
  reader.readAsText(file);
}

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

  const browseButton = document.querySelector('#browse');
  browseButton.addEventListener('change', (evt) => {
    handleFileSelect(evt);
  });

  // get the file contents as text so we can extract the header for use later
  d3.text(URL).then((txt) => processData(txt));
});
