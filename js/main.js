window.onload = function() {

  var file = document.getElementById("audio-file");
  var audio = document.getElementById("audio");

  file.onchange = function() {
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.smoothingTimeConstant = 0.7;

    analyser.fftSize = 4096;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    var hue = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      var bl = bufferLength * 2 / 256
      var bv = 0
      var ml = bufferLength * 8 / 256
      var mv = 0
      var hl = bufferLength * 32 / 256
      var hv = 0


      for (var i = 0; i < bl; i++) {
        bv += dataArray[i]
      }
      for (var i = bl; i < ml; i++) {
        mv += dataArray[i]
      }
      for (var i = ml; i < hl; i++) {
        hv += dataArray[i]
      }

      // for(var i=0; i<ml; i++){
      //   dataArray.set([0], i)
      // }
      // for(var i=hl; i<bufferLength; i++){
      //   dataArray.set([0], i)
      // }

      bv /= bl;
      mv /= ml;
      hv /= hl;

      hue += 0.5;

      // hue, sat, val
      ctx.fillStyle = `hsl(${(hue + hv * 90/255)%360},${mv * 100/255}%,${bv * 100/255}%)`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        var h = 180 * (i / bufferLength);
        var s = barHeight * 100 / 255;
        var v = 40 + (barHeight + (25 * (i / bufferLength))) * 20 / 255;

        barHeight = dataArray[i] / 255 * HEIGHT * 2 / 3;

        ctx.fillStyle = `hsl(${(hue+h) % 360 + 30},${s}%,${v}%)`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth + 1, barHeight);

        x += barWidth + 1;
      }
    }

    audio.play();
    renderFrame();
  };
};