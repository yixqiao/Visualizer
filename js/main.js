window.onload = function() {
  document.onkeypress = function(e) {
    e = e || window.event;
    if (e.key === 'c') {
      var intf = document.getElementById('interface');
      if (intf.style.display !== 'none') {
        intf.style.display = 'none';
      } else {
        intf.style.display = 'block';
      }
    }
  };


  var file = document.getElementById("audio-file");
  var audio = document.getElementById("audio");

  file.onchange = function() {
    document.getElementById('interface').style.display = 'none';

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

    analyser.fftSize = 4096;

    analyser.smoothingTimeConstant = 0.7;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    var hue = 0;

    const particleCount = 250;
    const particleRadius = 5;
    const moveSpeed = 20;

    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        mx: (Math.random() - 0.5) * moveSpeed,
        my: (Math.random() - 0.5) * moveSpeed
      })
    }
    console.log(particles);

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      var bl = bufferLength * 2 / 256
      var bv = 0
      var ml = bufferLength * 8 / 256
      var mv = 0
      var hl = bufferLength * 48 / 256
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

      bv /= bl * 255;
      bv = bv * bv * bv * bv * 1.25;
      bv = Math.min(bv, 1)

      mv /= ml * 255;
      mv = mv * mv * mv * 1.5;
      mv = Math.min(mv, 1)

      hv /= hl * 255;
      hv = hv * hv * 2;
      hv = Math.min(hv, 1)

      console.log(hv)

      hue += 0.5;

      // hue, sat, val
      ctx.fillStyle = `hsl(${(hue + mv * 90)%360},${Math.max(Math.min(100, hv * 2 * 100 - 30), 0)}%,${bv * 100}%)`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 255;

        var h = 180 * (i / bufferLength);
        var s = barHeight * 100;
        var v = 40 + (barHeight * 255 + (25 * (i / bufferLength))) * 20 / 255;

        barHeight = dataArray[i] / 255 * HEIGHT * 2 / 3;

        ctx.fillStyle = `hsl(${(hue+h) % 360 + 30},${s}%,${v}%)`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth + 1, barHeight);

        x += barWidth + 1;
      }

      // Particles
      ctx.fillStyle = `hsla(${(hue + mv * 90)%360},${Math.max(Math.min(100, mv * 1.2 * 100), 0)}%,${100 - bv * 40}%, ${hv * 100}%)`;
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, particleRadius * bv, 0, 2 * Math.PI);
        ctx.fill();
        p.x += p.mx * bv;
        p.y += p.my * bv;
        if (p.x < 0 || p.x >= WIDTH)
          p.mx *= -1;
        if (p.y < 0 || p.y >= HEIGHT)
          p.my *= -1;
      })
    }

    audio.play();
    renderFrame();
  };
};