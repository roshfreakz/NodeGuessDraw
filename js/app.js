var websocketgame = {
    // indicates if it is drawing now.
    isDrawing: false,

    // the starting point of next line drawing.
    startX: 0,
    startY: 0,

    // Contants
    LINE_SEGMENT: 0,
    CHAT_MESSAGE: 1,
}

// canvas context
var canvas = document.getElementById('drawing-pad');
var ctx = canvas.getContext('2d');


$(function () {

    if (window["WebSocket"]) {
        websocketgame.socket = new WebSocket("wss://app-websocket-js.herokuapp.com/");

        websocketgame.socket.onopen = function (e) {
            console.log('websocket connection established');
        };

        websocketgame.socket.onclose = function (e) {
            console.log('websocket connection Closed');
        };

        websocketgame.socket.onmessage = function (e) {
          // console.log(e.data);
            var data = JSON.parse(e.data);
            if (data.dataType === websocketgame.CHAT_MESSAGE) {
                $("#chat-history").append("<li>" + data.sender + " said: " + data.message + "</li>");
            } else if (data.dataType === websocketgame.LINE_SEGMENT) {
                drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
            }

        };

        $("#send").click(sendMessage);

        $("#chat-input").keypress(function (event) {
            if (event.keyCode === 13) {
                sendMessage();
            }
        });





    }

    // the logic of drawing in the Canvas
    $("#drawing-pad").mousedown(function (e) {
        // get the mouse x and y relative to the canvas top-left point.
        var mouseX = e.originalEvent.layerX || e.offsetX || 0;
        var mouseY = e.originalEvent.layerY || e.offsetY || 0;

        websocketgame.startX = mouseX;
        websocketgame.startY = mouseY;

        websocketgame.isDrawing = true;
    });

    $("#drawing-pad").mousemove(function (e) {
        // draw lines when is drawing
        if (websocketgame.isDrawing) {
            // get the mouse x and y 
            // relative to the canvas top-left point.
            var mouseX = e.originalEvent.layerX || e.offsetX || 0;
            var mouseY = e.originalEvent.layerY || e.offsetY || 0;

            if (!(mouseX === websocketgame.startX && mouseY === websocketgame.startY)) {
                drawLine(ctx, websocketgame.startX, websocketgame.startY, mouseX, mouseY, 1);

                // send the line segment to server
                var data = {};
                data.dataType = websocketgame.LINE_SEGMENT;
                data.startX = websocketgame.startX;
                data.startY = websocketgame.startY;
                data.endX = mouseX;
                data.endY = mouseY;
                websocketgame.socket.send(JSON.stringify(data));

                websocketgame.startX = mouseX;
                websocketgame.startY = mouseY;
            }
        }
    });

    $("#drawing-pad").mouseup(function (e) {
        websocketgame.isDrawing = false;
    });


})

// function sendMessage() {
//     var message = $("#chat-input").val();
//     websocketgame.socket.send(message);
//     $("#chat-input").val("");
// }

function sendMessage() {
    var message = $("#chat-input").val();
    
    // pack the message into an object.
    var data = {};
    data.dataType = websocketgame.CHAT_MESSAGE;
    data.message = message;
    
    websocketgame.socket.send(JSON.stringify(data));
    $("#chat-input").val("");
 }

function drawLine(ctx, x1, y1, x2, y2, thickness) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = "#000";
    ctx.stroke();
}