function playVid(mediaSource, start, isLoop) {

    

    if (restarting) {
        window.addEventListener("keyup", listener, true)
    }

    var canvas = document.getElementById("chimeraGame");
    var ctx = canvas.getContext("2d");

    function myHandler2(e) {
        escList = false

        cancelAnimationFrame(render)
        startGoing = false; video.muted = true; gameGoing = true; gameStart = false;
        new GoGame()
    }

    var video = document.createElement("video");
    if (mediaSource == "img/start.mp4")
        video.addEventListener('ended', myHandler2, false);
    video.src = mediaSource;
    video.autoPlay = false;
    video.loop = isLoop;
    var videoContainer = { video: video, ready: false };
    video.onerror = function (e) { }
    video.oncanplay = readyToPlayVideo;

    if (start) {
        video.addEventListener('ended', myHandler, false);
        function myHandler(e) {
            cancelAnimationFrame(render)
            playVid("img/loop.mp4", false, true)
            videoReady = true; videoReady2 = false;
            var helpField = document.getElementById("help")
            helpField.innerHTML = "Press &rang;Escape&lang; to start game!"
            helpField.style.display = "block"
        }
    }

    function readyToPlayVideo(event) {
        videoContainer.scale = Math.min(
            canvas.width / this.videoWidth,
            canvas.height / this.videoHeight);
        videoContainer.ready = true;
        videoContainer.video.play()
        render = requestAnimationFrame(updateCanvas);
    }

    function updateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (videoContainer !== undefined && videoContainer.ready) {
            video.muted = false;
            var scale = videoContainer.scale;
            var vidH = videoContainer.video.videoHeight;
            var vidW = videoContainer.video.videoWidth;
            var top = canvas.height / 2 - (vidH / 2) * scale;
            var left = canvas.width / 2 - (vidW / 2) * scale;
            ctx.drawImage(videoContainer.video, left, top, vidW * scale, vidH * scale);
            if (videoContainer.video.paused) { }
        }
        if (videoReady || videoReady2)
            render = requestAnimationFrame(updateCanvas);
        else if (gameStart) {
            cancelAnimationFrame(render)
            video.pause(); video.src = ''; video.load(); video.remove();
            start = false; video.muted = false; video.ended = "false"; gameStart = false; startGoing = true
        }
        else if (startGoing)
            render = requestAnimationFrame(updateCanvas);
    }

}
