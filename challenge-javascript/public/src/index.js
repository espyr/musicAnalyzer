window.onload = function () {
  // grab the canvas and audio element.
  var start = document.getElementById("start");
  var audio = document.getElementById("audio");
  let framesPerSecond = 40;

  start.onclick = function () {
    document.getElementById("start").style.visibility = "hidden";
    document.getElementById("audio").style.visibility = "visible";
    audio.src = "music.mp3";
    audio.load();
    audio.play();
    // create a new AudioContext node --> helps to make other audio nodes.
    var context = new AudioContext();
    // The analyser node cant work on a dom element -->convert the audio element into a node using createMediaElementSource.
    var src = context.createMediaElementSource(audio);
    // Analyser node --> give us the frequency data
    var analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    // context variable based on a 2d (used to draw shapes into the canvas.)
    var ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate((180 * Math.PI) / 180);

    //  connect all the node together so they can read each others data.
    src.connect(analyser);
    // this connects our music to the default output (speakers).
    analyser.connect(context.destination);

    // tells to analyser how large the array of data should be
    // frequency sample size
    // the size of the FFT used for frequency-domain analysis
    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    //  array to store our data (bufferLength = fftSize/2)
    var dataArray = new Uint8Array(bufferLength);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    //  slice's width = WIDTH / array of time data (= buffer which length = analyzer.frequencyBinCount).
    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    function renderFrame() {
      // setTimeout to delay when the next requestAnimationFrame call gets made.
      // slowing our animation down to framesPerSecond = 40 FPS.
      setTimeout(function () {
        // requestAnimationFrame = global function (argument = callback func)
        // It will call this function usually 60 times a second, before the paint event.
        //requestAnimationFrame calls callback func once. So in order to loop, we have to call it again inside.
        requestAnimationFrame(renderFrame);

        x = 0;
        // passing our Uint data array to the analyser node
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        for (var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          var r = barHeight + 25 * (i / bufferLength);
          var g = 150 * (i / bufferLength);
          var b = 200;

          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      }, 1000 / framesPerSecond);
    };

    audio.play();
    renderFrame();
  };
};
