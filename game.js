function Game() {
    gameStart = true
    playVid("img/start.mp4", false, false)
}

function Teleport(area, posX, posY) {
    curArea = area
    map[area].contains[posX][posY].type = "player"
    map[area].contains[posX][posY].rotation = "0"
    map[area].contains[posX][posY].equipment = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment
    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "none"
    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].type = "sidewalk"
    chimeraPos.area = area; chimeraPos.x = posX; chimeraPos.y = posY;
}

function GoGame() {
    function NumberWithLeadingZeroes(n) {
        if (n < 10)
            return ('000' + n.toString());
        else if (n < 100)
            return ('00' + n.toString());
        else if (n < 1000)
            return ('0' + n.toString());
        else
            return (n);
    }

    var alreadychecked, cancelAnimationFF, toDo, reset, won, radiatordone, finish, isPaused, toDoDone
    var speed = 6
    var drawingSmartphone = 0
    var score = 0
    var food = 5000
    var water = 6500
    var runningText = { step: 0, steps: 3200, text: "WELCOME TO CHIMERA, WATCH THIS SPACE AND GOOD LUCK...", curTable: "" }
    var toFill = []
    var notMove = true
    curArea = 10
    chimeraPos.x = 3
    chimeraPos.y = 3
    chimeraPos.area = curArea

    function dead() {
        document.removeEventListener("keydown", keyRecord)
        var audio = new Audio('img/generic/ahh.mp3');
        audio.play();
        runningText.text = "Due to an oversight or miscalculation on your part, you are now dead."
        runningText.step = 0; reset = true;
    }

    if (!gameStart) {
        clearInterval(changingC64)
        startGoing = false; gameGoing = true;
    }
    function refreshRadiators() {
        radiatordone = false
        for (var i = 0; i < map[curArea].contains.length; i++)
            for (var j = map[curArea].contains[i].length - 1; j >= 0; j--)
                if (map[curArea].contains[i][j].type.indexOf("radiator") >= 0)
                    map[curArea].contains[i][j].curr = 0
    }

    document.removeEventListener("keyup", Keypress)
    function keyRecord(e) {
        if (gameGoing && !animationGoing) {
            switch (e.key) {
                case "8":
                    gameTop()
                    break;
                case "6":
                    gameRight()
                    break;
                case "4":
                    gameLeft()
                    break;
                case "2":
                    gameBottom()
                    break;
                case "5":
                    gameFire()
                    break;
                case "0":
                    gamePause()
                    break;
            }
        }
    }
    document.addEventListener("keydown", keyRecord)

    var helpField = document.getElementById("help")
    helpField.innerHTML = "Moving: Numpad 8, 4, 6, 2. <br/>Interaction: Numpad 5. Pause game: Numpad 0.<br/> <a href='solutions.html' target='_blank' >&rang;Help&lang;</a>"
    helpField.style.display = "block"

    drawMap()

    var check = {}
    function drawMap() {
        if (reset && runningText.step >= runningText.steps) {
            reset = false
            cancelAnimationFrame(render)
            cancelAnimationFF = true
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = 'map.js';
            head.appendChild(script); gameGoing = false; startGoing = true; videoReady = false; videoReady2 = false; restarting = true; chimeraPos = {};
            var helpField = document.getElementById("help")
            helpField.innerHTML = "Press &rang;Escape&lang; to start game!"
            helpField.style.display = "block"
            playVid("img/loop.mp4", false, true)
            return 0;
        }

        if (renderer % 7 === 0 && !reset && !restarting && !isPaused && !won) {
            var thereIs
            if (map[curArea].contains[chimeraPos.x][chimeraPos.y].equipment == "none")
                food--
            else
                food -= 2

            for (var i = 0; i < map[curArea].contains.length; i++)
                for (var j = map[curArea].contains[i].length - 1; j >= 0; j--)
                    if (map[curArea].contains[i][j].type.indexOf("radiator") >= 0)
                        thereIs = true
            if (!thereIs)
                water--
            else
                water -= 17
        }
        else if ((reset || restarting) && !isPaused)
            food = water = 5000

        if (food < 0 || water < 0)
            dead()
        var canvas = document.getElementById("chimeraGame");
        var ctx = canvas.getContext("2d");
        var isTiming, refreshNeeded, radiator
        var toDraw = []
        var oncefordraw = false

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, 640, 400);
        if (reset || restarting)
            ctx.fillStyle = "#6e59b9"
        else if (map[curArea].blueroom || map[curArea].blueroomDone) {
            ctx.fillStyle = "#3958d0"
            gameWinIndex = 0
            for (var i = 0; i < Object.keys(map).length; i++)
                if (map[i].blueroomDone)
                    gameWinIndex++

            if (gameWinIndex > 3) {
                if (!finish) {
                    myAudio = new Audio('img/generic/finish.wav');
                    myAudio.addEventListener('ended', function () {
                        myAudio = null; myAudio = new Audio('img/generic/finishloop.wav');
                        myAudio.addEventListener('ended', function () {
                            this.currentTime = 0;
                            this.play();
                        }, false);
                        myAudio.play();
                    }, false);
                    myAudio.play();
                    runningText.text = "Congratulations, you have activated all four warheads, to ESCAPE, you must find a green room. But hurry up..."
                    runningText.step = 0;
                    finish = true
                }
            }
        }
        else if (map[curArea].blueroomDone)
            ctx.fillStyle = "#0004fb"
        else if (map[curArea].greenroom) {
            ctx.fillStyle = "#3c9824"
            for (var i = 0; i < Object.keys(map).length; i++)
                if (map[i].blueroomDone)
                    gameWinIndex++

            if (gameWinIndex >= 3) {
                if (!won) {
                    myAudio.pause()
                    myAudio = new Audio('img/generic/end.wav');
                    myAudio.addEventListener('ended', function () {
                        cancelAnimationFrame(render)
                        cancelAnimationFF = true
                        var head = document.getElementsByTagName('head')[0];
                        var script = document.createElement('script');
                        script.src = 'map.js';
                        head.appendChild(script);
                        gameGoing = false; startGoing = true; videoReady = false; videoReady2 = false; restarting = true;
                        var helpField = document.getElementById("help")
                        helpField.innerHTML = "Press &rang;Escape&lang; to start game!"
                        helpField.style.display = "block"
                        playVid("img/loop.mp4", false, true)
                        return 0;
                    }, false);
                    myAudio.play();
                    document.removeEventListener("keydown", keyRecord)
                    runningText.text = "The mission was been successfully completed and congratulations on a job well done. You may now look forward to Pandora, the gigagame, also by S.Anmad..."
                    runningText.step = 0;
                    won = true
                }
            }
        }
        else
            ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 640, 400);

        function RunTextRightToLeft() {
            runningText.step += 5
            ctx.fillStyle = "rgb(209,209,209)";
            ctx.font = "20px cyferki";
            ctx.save()
            ctx.translate(440 - runningText.step, 278);
            ctx.fillText(runningText.text, 0, 0);
            ctx.restore(); ctx.save();
            ctx.clearRect(440, 258, 200, 25);
            if (reset || restarting)
                ctx.fillStyle = "#6e59b9"
            else
                ctx.fillStyle = "#000000";
            ctx.fillRect(440, 258, 200, 25);
            ctx.restore(); ctx.save()
            ctx.clearRect(0, 258, 220, 25);
            if (reset || restarting)
                ctx.fillStyle = "#6e59b9"
            else
                ctx.fillStyle = "#000000";
            ctx.fillRect(0, 258, 220, 25);
            ctx.restore()
        }
        if (runningText.step < runningText.steps)
            RunTextRightToLeft()


        if (toDo) {
            if (toDo.bottom)
                var ito = true
        }
        else
            var ito = false

        for (var i = 0; i < map[curArea].contains.length; i++)
            for (var j = map[curArea].contains[i].length - 1; j >= 0; j--) {
                if (map[curArea].contains[i][j].type.indexOf("wall") >= 0) {
                    if (!ito || (ito && i != chimeraPos.x + 1))
                        for (var m = 0; m < spreadSheet[curArea].length; m++)
                            if (spreadSheet[curArea][m] && spreadSheet[curArea][m].posX == i && spreadSheet[curArea][m].posY == j)
                                if (!map[curArea].darkroom)
                                    ctx.drawImage(spreadSheet[curArea][m], 130 + map[curArea].contains[i][j].x * 27 + map[curArea].contains[i][j].y * 28, 90 + map[curArea].contains[i][j].y * 13 - map[curArea].contains[i][j].x * 12, 60, 90);
                }
                else if (map[curArea].contains[i][j].type.indexOf("sidewalk") < 0 && map[curArea].contains[i][j].type.indexOf("player") < 0 && map[curArea].contains[i][j].type.indexOf("radiator") < 0) {
                    if (!Array.isArray(spreadSheetGeneric[map[curArea].contains[i][j].type])) {
                        if (!map[curArea].darkroom)
                            ctx.drawImage(spreadSheetGeneric[map[curArea].contains[i][j].type], 130 + map[curArea].contains[i][j].x * 27 + map[curArea].contains[i][j].y * 28, 90 + map[curArea].contains[i][j].y * 13 - map[curArea].contains[i][j].x * 12, 60, 90);
                    } else {
                        toDraw.push(map[curArea].contains[i][j])
                        if (!toDraw[toDraw.length - 1].curr)
                            toDraw[toDraw.length - 1].curr = 0
                    }
                    if (toDraw.length > 0) {
                        for (var k = 0; k < toDraw.length; k++) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(spreadSheetGeneric[toDraw[k].type][toDraw[k].curr], 130 + toDraw[k].x * 27 + toDraw[k].y * 28, 90 + toDraw[k].y * 13 - toDraw[k].x * 12, 60, 90)
                            if (spreadSheetGeneric[toDraw[k].type].length - 1 > toDraw[k].curr) {
                                if (renderer % 20 === 0 && !reset && !restarting)
                                    toDraw[k].curr++
                            }
                            else
                                if (renderer % 20 === 0)
                                    toDraw[k].curr = 0
                        }
                        refreshNeeded = true
                    }
                }
                else if (!toDo && map[curArea].contains[i][j].type.indexOf("player") >= 0) {
                    if (!map[curArea].darkroom)
                        ctx.drawImage(spreadSheetGeneric[map[curArea].contains[i][j].type][map[curArea].contains[i][j].rotation], 130 + map[curArea].contains[i][j].x * 27 + map[curArea].contains[i][j].y * 28, 90 + map[curArea].contains[i][j].y * 13 - map[curArea].contains[i][j].x * 12, 60, 90)
                    chimeraPos.x = i; chimeraPos.y = j; chimeraPos.area = curArea;
                }
                else if (toDo && map[curArea].contains[i][j].type.indexOf("player") >= 0) {
                    if (toDo.top) {
                        if (isOdd(toDo.time)) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img, toDo.x - (toDo.time / speed * 27) + toDo.x2, toDo.y - (toDo.time / speed * 13) - toDo.y2, 60, 90)
                        }
                        else
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img2, toDo.x - (toDo.time / speed * 27) + toDo.x2, toDo.y - (toDo.time / speed * 13) - toDo.y2, 60, 90)

                        for (var xx = 1; xx < map[curArea].contains[i].length; xx++) {
                            if (map[curArea].contains[i][j - xx] && map[curArea].contains[i][j - xx].type.indexOf("sidewalk") < 0) {
                                for (var m = 0; m < spreadSheet[curArea].length; m++)
                                    if (spreadSheet[curArea][m] && spreadSheet[curArea][m].posX == i && spreadSheet[curArea][m].posY == j - xx)
                                        if (!map[curArea].darkroom)
                                            ctx.drawImage(spreadSheet[curArea][m], 130 + map[curArea].contains[i][j - xx].x * 27 + map[curArea].contains[i][j - xx].y * 28, 90 + map[curArea].contains[i][j - xx].y * 13 - map[curArea].contains[i][j - xx].x * 12, 60, 90);
                            }
                            if (map[curArea].contains[i - 1] && map[curArea].contains[i - 1][j - xx] && map[curArea].contains[i - 1][j - xx].type.indexOf("sidewalk") < 0) {
                                for (var m = 0; m < spreadSheet[curArea].length; m++)
                                    if (spreadSheet[curArea][m] && spreadSheet[curArea][m].posX == i - 1 && spreadSheet[curArea][m].posY == j - xx)
                                        if (!map[curArea].darkroom)
                                            ctx.drawImage(spreadSheet[curArea][m], 130 + map[curArea].contains[i - 1][j - xx].x * 27 + map[curArea].contains[i - 1][j - xx].y * 28, 90 + map[curArea].contains[i - 1][j - xx].y * 13 - map[curArea].contains[i - 1][j - xx].x * 12, 60, 90);
                            }
                        }
                    }

                    if (toDo.left)
                        if (isOdd(toDo.time)) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img, toDo.x - (toDo.time / speed * 27) + toDo.x2, toDo.y - toDo.y2 + (toDo.time / speed * 12), 60, 90)
                        }
                        else
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img2, toDo.x - (toDo.time / speed * 27) + toDo.x2, toDo.y - toDo.y2 + (toDo.time / speed * 12), 60, 90)

                    if (toDo.right)
                        if (isOdd(toDo.time)) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img, toDo.x + (toDo.time / speed * 27) + toDo.x2, toDo.y - toDo.y2 - (toDo.time / speed * 12), 60, 90)
                        }
                        else
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img2, toDo.x + (toDo.time / speed * 27) + toDo.x2, toDo.y - toDo.y2 - (toDo.time / speed * 12), 60, 90)

                    if (toDo.bottom && !oncefordraw) {
                        for (var xx = map[curArea].contains[i].length; xx > 0; xx--)
                            if (j + xx > chimeraPos.y)
                                if (map[curArea].contains[i + 1][j + xx] && map[curArea].contains[i + 1][j + xx].type.indexOf("sidewalk") < 0)
                                    for (var m = 0; m < spreadSheet[curArea].length; m++)
                                        if (spreadSheet[curArea][m] && spreadSheet[curArea][m].posX == i + 1 && spreadSheet[curArea][m].posY == j + xx)
                                            if (!map[curArea].darkroom)
                                                ctx.drawImage(spreadSheet[curArea][m], 130 + map[curArea].contains[i + 1][j + xx].x * 27 + map[curArea].contains[i + 1][j + xx].y * 28, 90 + map[curArea].contains[i + 1][j + xx].y * 13 - map[curArea].contains[i + 1][j + xx].x * 12, 60, 90);

                        if (toDo.last == 2 && renderer % 6 !== 0) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img, toDo.x + (toDo.time / 2 / (speed + 1) * 27) + toDo.x2, toDo.y + (toDo.time / 2 / (speed + 1) * 13) - toDo.y2, 60, 90)
                        }

                        else if (toDo.last == 1 && renderer % 6 !== 0) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img2, toDo.x + (toDo.time / 2 / (speed + 1) * 27) + toDo.x2, toDo.y + (toDo.time / 2 / (speed + 1) * 13) - toDo.y2, 60, 90)
                        }

                        else if ((toDo.last == 2 && renderer % 6 === 0) || !toDo.last) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img, toDo.x + (toDo.time / 2 / (speed + 1) * 27) + toDo.x2, toDo.y + (toDo.time / 2 / (speed + 1) * 13) - toDo.y2, 60, 90)
                            toDo.last = 1
                        }

                        else if (renderer % 6 === 0) {
                            if (!map[curArea].darkroom)
                                ctx.drawImage(toDo.img2, toDo.x + (toDo.time / 2 / (speed + 1) * 27) + toDo.x2, toDo.y + (toDo.time / 2 / (speed + 1) * 13) - toDo.y2, 60, 90)
                            toDo.last = 2
                        }
                        oncefordraw = true

                        for (var xx = 0; xx < map[curArea].contains[i].length; xx++)
                            if (j - xx < chimeraPos.y)
                                if (map[curArea].contains[i + 1][j - xx] && map[curArea].contains[i + 1][j - xx].type.indexOf("sidewalk") < 0)
                                    for (var m = 0; m < spreadSheet[curArea].length; m++)
                                        if (spreadSheet[curArea][m] && spreadSheet[curArea][m].posX == i + 1 && spreadSheet[curArea][m].posY == j - xx) {
                                            var obj = { m: spreadSheet[curArea][m], x: i + 1, y: j - xx }
                                            toFill.push(obj)
                                        }
                    }

                    if ((toDo.bottom && toDo.time / 2 > speed + 0.1) || (!toDo.bottom && toDo.time >= speed)) {
                        toDo.toCheck.type = "sidewalk"; toDo.toCheck.rotation = "null";
                        if (toDo.top) {
                            map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].type = "player"
                            map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].rotation = "2"
                            map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].equipment = toCheck.equipment
                        }
                        else if (toDo.right) {
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].type = "player"
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].rotation = "1"
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].equipment = toCheck.equipment
                        }
                        else if (toDo.left) {
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].type = "player"
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].rotation = "3"
                            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].equipment = toCheck.equipment
                        }
                        else if (toDo.bottom) {
                            toDo.bottom = false
                            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].type = "player"
                            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].rotation = "0"
                            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].equipment = toCheck.equipment
                        }
                        if (toDo.top)
                            chimeraPos.x--
                        else if (toDo.right)
                            chimeraPos.y++
                        else if (toDo.left)
                            chimeraPos.y--
                        else if (toDo.bottom)
                            chimeraPos.x++
                        document.addEventListener("keydown", keyRecord)
                        notMove = true;

                        toDo = false;
                    }

                    else
                        if (renderer % 6 === 0)
                            toDo.time++
                }

                else if (map[curArea].contains[i][j].type.indexOf("radiator") >= 0) {
                    if (!map[curArea].contains[i][j].curr)
                        map[curArea].contains[i][j].curr = 0

                    if (!map[curArea].darkroom)
                        ctx.drawImage(spreadSheetGeneric[map[curArea].contains[i][j].type][map[curArea].contains[i][j].curr], 130 + map[curArea].contains[i][j].x * 27 + map[curArea].contains[i][j].y * 28, 90 + map[curArea].contains[i][j].y * 13 - map[curArea].contains[i][j].x * 12, 60, 90)

                    if (spreadSheetGeneric[map[curArea].contains[i][j].type].length - 1 > map[curArea].contains[i][j].curr) {
                        if (renderer % 40 === 0)
                            map[curArea].contains[i][j].curr++
                    }
                    else if (!radiatordone) {
                        radiatordone = true
                        runningText.text = "The radiator does not help your water supply."
                        runningText.step = 0;
                    }
                }

                for (var xxx = 0; xxx < toFill.length; xxx++) {
                    if (toFill[xxx].x == i && toFill[xxx].y == j) {
                        if (!map[curArea].darkroom)
                            ctx.drawImage(toFill[xxx].m, 130 + map[curArea].contains[toFill[xxx].x][toFill[xxx].y].x * 27 + map[curArea].contains[toFill[xxx].x][toFill[xxx].y].y * 28, 90 + map[curArea].contains[toFill[xxx].x][toFill[xxx].y].y * 13 - map[curArea].contains[toFill[xxx].x][toFill[xxx].y].x * 12, 60, 90);
                        toFill.splice(xxx, 1)
                    }
                }
            }


        var imgScr = document.getElementById("scoresStatic")
        ctx.drawImage(imgScr, 125, 285, 400, 22)

        if (spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment] || spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment + "A"]) {
            var imgScr = spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment]
            ctx.drawImage(imgScr, 0, 30, 57, 63, 158, 325, 70, 70);
        }
        else if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "warhead") {
            var imgScr = document.getElementById("warheadpng")
            ctx.drawImage(imgScr, 0, 30, 57, 63, 158, 325, 70, 70);
        }
        else {
            var imgScr = document.getElementById("nonepng")
            ctx.drawImage(imgScr, 158, 325, 70, 70)
        }

        var imgScr = document.getElementById("chimerapng")
        ctx.drawImage(imgScr, 248, 325, 140, 70)

        var imgScr = smartphone[drawingSmartphone]
        ctx.drawImage(imgScr, 415, 330, 80, 60)
        if (drawingSmartphone < 3 && renderer % 20 === 0)
            drawingSmartphone++
        else if (renderer % 20 === 0)
            drawingSmartphone = 0

        ctx.font = "25px cyferki";

        ctx.fillStyle = "rgb(180,224,239)";
        ctx.fillText(NumberWithLeadingZeroes(score), 154, 323);

        ctx.fillStyle = "rgb(209,209,209)";
        ctx.fillText(NumberWithLeadingZeroes(food), 282, 323);

        ctx.fillStyle = "rgb(202,223,187)";
        ctx.fillText(NumberWithLeadingZeroes(water), 415, 323);

        drawing = false
        toCheck = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y]
    }

    var toCheck = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y]

    function gameTop() {
        document.removeEventListener("keydown", keyRecord)
        notMove = false

        var canvas = document.getElementById("chimeraGame");
        var ctx = canvas.getContext("2d");

        if (toCheck.type == "player" && map[chimeraPos.area].contains[chimeraPos.x - 1] && map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].type && map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].type == "sidewalk") {
            toCheck.rotation = "2"; drawing = true; toDo = {}
            toDo.img = spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].type][map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.img2 = spreadSheetMoving[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.x = 130 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 27)
            toDo.x2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 28
            toDo.y = 90 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 13)
            toDo.y2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 12
            toDo.time = 0
            toDo.top = true
            toDo.toCheck = toCheck
        }
        else if (toCheck.type == "player" && !map[chimeraPos.area].contains[chimeraPos.x - 1] && map[chimeraPos.area - 8].contains[6][chimeraPos.y].type && map[chimeraPos.area - 8].contains[6][chimeraPos.y].type == "sidewalk") {
            toCheck.type = "sidewalk"; toCheck.rotation = "null"
            map[chimeraPos.area - 8].contains[6][chimeraPos.y].equipment = toCheck.equipment
            toCheck.equipment = "null"
            map[chimeraPos.area - 8].contains[6][chimeraPos.y].type = "player"
            map[chimeraPos.area - 8].contains[6][chimeraPos.y].rotation = "2"
            chimeraPos.x = 6; chimeraPos.area -= 8; curArea = chimeraPos.area; notMove = true; refreshRadiators();
            document.addEventListener("keydown", keyRecord)
        }
        else {
            toCheck.rotation = "2"; notMove = true;
            document.addEventListener("keydown", keyRecord)
        }
    }

    function gameRight() {
        document.removeEventListener("keydown", keyRecord)
        notMove = false

        var canvas = document.getElementById("chimeraGame");
        var ctx = canvas.getContext("2d");

        if (toCheck.type == "player" && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1] && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].type && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].type == "sidewalk") {
            toCheck.rotation = "1"; drawing = true; toDo = {};
            toDo.img = spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].type][map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.img2 = spreadSheetMoving[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.x = 130 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 27)
            toDo.x2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 28
            toDo.y = 90 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 13)
            toDo.y2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 12
            toDo.time = 0; toDo.right = true; toDo.toCheck = toCheck;
        }
        else if (toCheck.type == "player" && !map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1] && map[chimeraPos.area + 1].contains[chimeraPos.x][0].type && map[chimeraPos.area + 1].contains[chimeraPos.x][0].type == "sidewalk") {
            toCheck.type = "sidewalk"; toCheck.rotation = "null"
            map[chimeraPos.area + 1].contains[chimeraPos.x][0].equipment = toCheck.equipment
            toCheck.equipment = "null"
            map[chimeraPos.area + 1].contains[chimeraPos.x][0].type = "player"
            map[chimeraPos.area + 1].contains[chimeraPos.x][0].rotation = "1"
            chimeraPos.y = 0; chimeraPos.area += 1; curArea = chimeraPos.area; notMove = true; refreshRadiators()
            document.addEventListener("keydown", keyRecord)
        }
        else {
            toCheck.rotation = "1"
            notMove = true
            document.addEventListener("keydown", keyRecord)
        }
    }

    function gameLeft() {
        document.removeEventListener("keydown", keyRecord)
        notMove = false

        var canvas = document.getElementById("chimeraGame");
        var ctx = canvas.getContext("2d");

        if (toCheck.type == "player" && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1] && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].type && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].type == "sidewalk") {
            toCheck.rotation = "3"; drawing = true; toDo = {};
            toDo.img = spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].type][map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.img2 = spreadSheetMoving[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.x = 130 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 27)
            toDo.x2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 28
            toDo.y = 90 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 13)
            toDo.y2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 12
            toDo.time = 0; toDo.left = true; toDo.toCheck = toCheck;
        }
        else if (toCheck.type == "player" && !map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1] && map[chimeraPos.area - 1].contains[chimeraPos.x][6].type && map[chimeraPos.area - 1].contains[chimeraPos.x][6].type == "sidewalk") {
            toCheck.type = "sidewalk"; toCheck.rotation = "null"
            map[chimeraPos.area - 1].contains[chimeraPos.x][6].equipment = toCheck.equipment
            toCheck.equipment = "null"
            map[chimeraPos.area - 1].contains[chimeraPos.x][6].type = "player"
            map[chimeraPos.area - 1].contains[chimeraPos.x][6].rotation = "3"
            chimeraPos.y = 6; chimeraPos.area -= 1; curArea = chimeraPos.area; notMove = true; refreshRadiators();
            document.addEventListener("keydown", keyRecord)
        }
        else {
            toCheck.rotation = "3"; notMove = true;
            document.addEventListener("keydown", keyRecord)
        }
    }

    function gameBottom() {
        document.removeEventListener("keydown", keyRecord)
        notMove = false

        var canvas = document.getElementById("chimeraGame");
        var ctx = canvas.getContext("2d");

        toCheck.rotation = "0"

        if (toCheck.type == "player" && map[chimeraPos.area].contains[chimeraPos.x + 1] && map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].type && map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].type == "sidewalk") {
            drawing = true; toDo = {};
            toDo.img = spreadSheetGeneric[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].type][map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            toDo.img2 = spreadSheetMoving[map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation]
            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].type = "player"
            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].rotation = "0"
            map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].equipment = toCheck.equipment
            toDo.x = 130 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 27)
            toDo.x2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 28
            toDo.y = 90 + (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].y * 13)
            toDo.y2 = map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].x * 12
            toDo.time = 0; toDo.bottom = true; toDo.toCheck = toCheck;
        }
        else if (toCheck.type == "player" && !map[chimeraPos.area].contains[chimeraPos.x + 1] && map[chimeraPos.area + 8].contains[0][chimeraPos.y].type && map[chimeraPos.area + 8].contains[0][chimeraPos.y].type == "sidewalk") {
            toCheck.type = "sidewalk"; toCheck.rotation = "null";
            map[chimeraPos.area + 8].contains[0][chimeraPos.y].equipment = toCheck.equipment
            toCheck.equipment = "null"
            map[chimeraPos.area + 8].contains[0][chimeraPos.y].type = "player"
            map[chimeraPos.area + 8].contains[0][chimeraPos.y].rotation = "0"
            chimeraPos.x = 0; chimeraPos.area += 8; curArea = chimeraPos.area; refreshRadiators(); notMove = true;
            document.addEventListener("keydown", keyRecord)
        }
        else {
            toCheck.rotation = "0"
            notMove = true
            document.addEventListener("keydown", keyRecord)
        }
    }

    function checkRotation() {
        switch (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].rotation) {
            case "0":
                if (map[chimeraPos.area].contains[chimeraPos.x + 1] && map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y])
                    interaction(map[chimeraPos.area].contains[chimeraPos.x + 1][chimeraPos.y].type, { "area": chimeraPos.area, "x": chimeraPos.x + 1, "y": chimeraPos.y })
                break;
            case "1":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1])
                    interaction(map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y + 1].type, { "area": chimeraPos.area, "x": chimeraPos.x, "y": chimeraPos.y + 1 })
                break;
            case "2":
                if (map[chimeraPos.area].contains[chimeraPos.x - 1] && map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y])
                    interaction(map[chimeraPos.area].contains[chimeraPos.x - 1][chimeraPos.y].type, { "area": chimeraPos.area, "x": chimeraPos.x - 1, "y": chimeraPos.y })
                break;
            case "3":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1])
                    interaction(map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y - 1].type, { "area": chimeraPos.area, "x": chimeraPos.x, "y": chimeraPos.y - 1 })
        }
    }

    function gameFire() {
        if ((!map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment && !alreadychecked) || (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "none" && !alreadychecked))
            checkRotation()
        else if (chimeraPos.area == "21" && map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "pyramid") {
            map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "warhead"
            score += 100
            runningText.text = "You have created a warhead, take it to the blue room. But hurry... Your food is running out faster."
            runningText.step = 0;
        }
        else
            switch (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment) {
                case "bread":
                    if (alreadychecked) {
                        alreadychecked = false
                        map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "none"
                        food += 1200; score += 5;
                        runningText.text = "The bread raises your food supplies."
                        runningText.step = 0;
                    }
                    else
                        checkRotation()
                    break;
                case "water":
                    if (alreadychecked) {
                        alreadychecked = false
                        map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "none"
                        water += 1500; score += 5;
                        runningText.text = "The drink did you good."
                        runningText.step = 0;
                    }
                    else
                        checkRotation()
                    break;
                case "torch":
                    if (map[curArea].darkroom) {
                        map[curArea].darkroom = false
                        map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "warhead"
                        alreadychecked = false; score += 100;
                        runningText.text = "You have created a warhead, take it to the blue room. But hurry... Your food is running out faster."
                        runningText.step = 0;
                    }
                    else
                        checkRotation()
                    break;
                case "warhead":
                    if (map[curArea].blueroom) {
                        map[curArea].blueroom = false
                        map[curArea].blueroomDone = true
                        map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "none"
                        score += 175; water += 1500; food += 1500;
                        runningText.text = "You have activated a warhead, it has replenish your food and water supplies."
                        runningText.step = 0;
                    }
                    else if (!alreadychecked)
                        checkRotation()
                    else
                        alreadychecked = false
                    break;
                default:
                    if (!alreadychecked)
                        checkRotation()
                    else
                        alreadychecked = false
            }
    }

    function interaction(data, location) {
        switch (data) {
            case "spanner":
                map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "spanner"
                score += 75
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                runningText.text = "You have found a spanner.                 Your food is running out faster."
                runningText.step = 0;
                break;
            case "computer":
                runningText.text = "You had to see a hind, so I will leave you with that one: Follow to instructions mentioned on help page and don't touch the computers. They only wastes your really important time and supplies."
                runningText.step = 0;
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                break;
            case "bread":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment != "key") {
                    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "bread"
                    runningText.text = "You have found a piece of bread.                 Your food is running out faster."
                    runningText.step = 0;
                }
                else {
                    food += 1200
                    runningText.text = "The bread raises your food supplies."
                    runningText.step = 0;
                }
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                score += 10
                break;
            case "radiator":
                dead(); break;
            case "torch":
                map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "torch"
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                score += 25
                runningText.text = "You have found a torch, take it to the dark room. But hurry... Your food is running out faster."
                runningText.step = 0;
                break;
            case "pandora":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "key") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    score += 25
                    runningText.text = "You have eliminated a box that used to belong to Pandora."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "door":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "key") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    score += 25
                    runningText.text = "You have unlocked a door."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "forcefield":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "spanner") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    score += 25
                    runningText.text = "You have eliminated an electric fence."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "water":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "bread")
                    food += 1500
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment != "key") {
                    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "water"
                    runningText.text = "This is a mug."
                    runningText.step = 0;
                }
                else {
                    water += 1500
                    runningText.text = "The drink did you good"
                    runningText.step = 0;
                }
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                alreadychecked = false
                score += 15; break;
            case "nut":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "spanner") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "warhead"
                    score += 100
                    runningText.text = "You have created a warhead, take it to the blue room. But hurry... Your food is running out faster."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "hourglass":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "pyramid") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    score += 25
                    runningText.text = "You have eliminated a hourglass."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "toaster":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "bread") {
                    map[location.area].contains[location.x][location.y].type = "water"
                    score += 25
                    runningText.text = "You have eliminated a toaster, but due to overall chaos, in its place appears a lifes saving drink."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "pyramid":
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "pyramid"
                score += 25
                runningText.text = "You have found a pyramid, use it to eliminate hourglasses on whole spaceship.                 Your food is running out faster."
                runningText.step = 0;
                break;
            case "padlock":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "key") {
                    map[location.area].contains[location.x][location.y].type = "sidewalk"
                    map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "warhead"
                    score += 100
                    runningText.text = "You have created a warhead, take it to the blue room. But hurry... Your food is running out faster."
                    runningText.step = 0;
                }
                else
                    dead(); break;
            case "key":
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "bread")
                    food += 1200
                if (map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment == "water")
                    water += 1500
                map[location.area].contains[location.x][location.y].type = "sidewalk"
                map[chimeraPos.area].contains[chimeraPos.x][chimeraPos.y].equipment = "key"
                score += 25
                runningText.text = "You have found a key.                 Your food is running out faster."
                runningText.step = 0;
                break;
            default:
                alreadychecked = true
                gameFire()
        }
    }

    function gamePause() {
        if (!isPaused) {
            document.removeEventListener("keydown", keyRecord)
            isPaused = true
            runningText.text = "Your game is paused now."
            runningText.step = 0;
            document.addEventListener("keydown", pauseRelease)
        }
        else {
            document.removeEventListener("keydown", pauseRelease)
            document.addEventListener("keydown", keyRecord)
            isPaused = false
            runningText.text = "Your can continue playing now."
            runningText.step = 0;
        }
    }

    var pauseRelease = function (e) {
        switch (e.key) {
            case "0":
                gamePause(); break;
        }
    }

    var render = this.render = function () {
        if (!cancelAnimationFF) {
            drawMap()
            renderer = requestAnimationFrame(render)
        }
    }
    this.render()
}
