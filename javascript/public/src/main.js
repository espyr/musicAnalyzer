$(function () {
  var start = document.getElementById("start");
  var audio = document.getElementById("player");
  var elem = document.getElementById("visualiser");
  let framesPerSecond = 40;
  start.onclick = function () {
    document.getElementById("start").style.visibility = "hidden";
    document.getElementById("player").style.visibility = "visible";
    audio.play();
  };
  // create a new AudioContext node --> get at all the frequencies.
  var context = new AudioContext();
  // Analyser node --> will provide us with the real time frequency data
  var analyser = context.createAnalyser();
  // by setting fftSize --> amounts to the resolution of our analyser object.
  // tells to analyser how large the array of data should be( frequency sample size )
  // the size of the FFT used for frequency-domain analysis
  analyser.fftSize = 64;
  //  array to store our data (bufferLength = fftSize/2)
  //  pass as data to d3
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // binds the audio html element to the  canplay event which is fired when the user agent can play the media
  $("#player").bind("canplay", function () {
    // The analyser node cant work on a dom element --> convert the audio element into a node using createMediaElementSource.
    //  pass the audio to context.createMediaElementSource --> get the frequency data(= source).
    var source = context.createMediaElementSource(this);
    //  connect our data to the analyser node, so they can read each others data.
    source.connect(analyser);
    // this connects our music to the default output (speakers).
    analyser.connect(context.destination);
  });
  var width = elem.parentElement.clientWidth,
    height = document.getElementById("second").clientHeight,
    barPadding = 1;
  console.log(height);
  // This inserts a new <svg> element to the 'visualiser', and assigns the SVG a width and a height.
  // D3.js is a JavaScript library fo creating interactive data visualizations
  // with scalable vector grafics (SVG, image format, don’t rely on pixels but on ‘vector’ data.)
  var svg = d3
    .select("#visualiser")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  var update = function (data) {
    // selects all rects inside of svg
    rect = svg.selectAll("rect").data(data);
    // enter() returns a placeholder selection for each data point,
    rect
      .enter()
      // inserts a rect into the DOM.
      .append("rect");
    //every rect must have x, y, width, and height.
    rect
    // the width is set as a fraction of the SVG width and number of data points (proportional to the number of the values) , minus a padding value
      .attr("width", function () {
        return width / data.length - barPadding;
      })
      // d = data value
      .attr("height", function (d) {
        return d;
      })
      //i = value’s position in the data set.
      // bars will be evenly spaced to the width of the SVG (whether we have 100 data values or 5).
      .attr("x", function (d, i) {
        return i * (width / data.length);
      })
      .attr("fill", function (d) {
        return "rgb(146, 36, " + d * 10 + ")";
      });
  };
  update(frequencyData);
  // it uses requestAnimationFrame ( = global function (argument = callback func)) for fluid animation  which will call this function usually 60 times/sec
  // d3 timer provides an queue --> managing thousands of animations + synchronized timing
  // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and 
  // requests that the browser calls a specified function to update an animation before the next repaint. 
  d3.timer(function () {
    // slowing our animation down to framesPerSecond = 40 FPS (40Hz).
    setTimeout(function () {
      // passing our Uint data (= frequency data (0-255) ) array to the analyser node
      // each item in the array represents the decibel value for a specific frequency
      // The getByteFrequencyData() method of the AnalyserNode interface copies the current 
      // frequency data into a Uint8Array 
      analyser.getByteFrequencyData(frequencyData);
    }, 1000 / framesPerSecond);
    update(frequencyData);
  });
});
