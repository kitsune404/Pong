"use strict";

var gl;
var canvas;
var program;
var leftScoreBoard;
var rightScoreBoard;
var intervalID;
var keys;
//Object Size Variables
var HEIGHT = .1;
var WIDTH = .0125;
var PADDLE = .1; //Distance From Border To Paddle
var BOX = .01;
//Object Movement Variables
//var MOVE = .0075;
var XMOVE;
var YMOVE;
var PMOVE = .03;
var isRight;
var isUp;
var MAXMOVE = .020;
var MINMOVE = .005;
//Object Position Variables
var leftY;
var rightY;
var pointX;
var pointY;
//Rendering
var squarePoints;
//Game Records
var scoreLeft;
var scoreRight;
var hits;

var whiteTex;
var whiteImage;
var uTextureSampler;
var isTexturing = false;
var ucolor;
var newColor;
var vTexCoord;

window.onload = function init(){
    leftScoreBoard = document.getElementById("player1Score");
    rightScoreBoard = document.getElementById("player2Score");
    canvas = document.getElementById("canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't available");
    }

    //Initialize Textures
    whiteTex = gl.createTexture();
    whiteImage = new Image();
    whiteImage.onload = function(){ handleTextureLoaded(whiteImage,whiteTex);};
    whiteImage.src = 'brickwork-texture.jpg';
    //whiteImage.src = 'white.png';
    newColor = vec4(1,1,1,1);

    determineProgram();

    leftY = 0;
    rightY = 0;
    scoreLeft = 0;
    scoreRight = 0;

    resetMatch();

    window.addEventListener("keydown",keysPressed,false);
    window.addEventListener("keyup",keysReleased,false);
    keys = [];

    update();
    buffer();
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    setFeedback("");

};

function determineProgram(){
    debugger;
    if(isTexturing){
        program = initShaders(gl,"vertex.glsl","fragment.glsl");
        uTextureSampler = gl.getUniformLocation(program, "textureSampler");
    }else{
        program = initShaders(gl,"color-vertex.glsl","color-fragment.glsl");
        ucolor = gl.getUniformLocation(program,"newColor");
        gl.uniform4fv(ucolor,newColor);
    }
    gl.useProgram(program);
}

function keysPressed(e){
    if(e.keyCode === 84){
        isTexturing = !isTexturing;
        clearInterval(intervalID);
        determineProgram();
        buffer();
        reset();
    }
    keys[e.keyCode] = true;
}

function keysReleased(e){
    keys[e.keyCode] = false;
}

function reset(){
    leftY = 0;
    rightY = 0;
    scoreLeft = 0;
    scoreRight = 0;
    resetMatch();
    intervalID = window.setInterval(update,16);
}

function resetMatch(){
    pointX = 0;
    pointY = 0;
    hits = 0;
    XMOVE = Math.random() * .005 + MINMOVE;
    YMOVE = Math.random() * MINMOVE;
    isRight = Math.random() >= .5;
    isUp = Math.random() >= .5;
    setFeedback();
}

function update(){

    if(keys[87]){
        if(leftY < 1.0 - HEIGHT - HEIGHT) {
            leftY += PMOVE;
        }
    }
    if(keys[83]){
        if(leftY > -1.0 + HEIGHT + HEIGHT){
            leftY -= PMOVE;
        }
    }
    if(keys[38]){
        if(rightY < 1.0 - HEIGHT - HEIGHT){
            rightY += PMOVE;
        }
    }
    if(keys[40]){
        if(rightY > -1.0 + HEIGHT + HEIGHT) {
            rightY -= PMOVE;
        }
    }
    if(keys[67]){
        debugger;
        if(!isTexturing){
            newColor = vec4(Math.random(),Math.random(),Math.random(),1.0);
            gl.uniform4fv(ucolor,newColor);
        }
    }

    var CHANGEC = .01;
    if(isRight){
        if(pointX >= 1.1){
            scoreLeft++;
            setFeedback("");
            resetMatch();
        }else{
            if(pointX >= 1 - PADDLE - WIDTH && pointX <= 1 - PADDLE + WIDTH && pointY <= rightY + HEIGHT + BOX && pointY >= rightY - HEIGHT - BOX){
                isRight = false;
                hits++;
                YMOVE = Math.max(CHANGEC * Math.abs(pointY - rightY) * Math.random() + (hits * .0005),MAXMOVE);
                XMOVE = Math.max(CHANGEC * (.1 - Math.abs(pointY - rightY)) * Math.random() + (hits * .0005), MAXMOVE);
                isUp = pointY - rightY >= 0;
            }else{
                pointX += XMOVE;
            }
        }
    }else{
        if(pointX <= -1.1){
            scoreRight++;
            setFeedback("");
            resetMatch();
        }else{
            if(pointX <= -1 + PADDLE + WIDTH && pointX >= -1 + PADDLE - WIDTH && pointY <= leftY + HEIGHT + BOX && pointY >= leftY - HEIGHT - BOX){
                isRight = true;
                hits++;
                YMOVE = Math.max(CHANGEC * Math.random() * Math.abs(pointY - leftY) + (hits * .0005),MAXMOVE);
                XMOVE = Math.max(CHANGEC * Math.random() * (.1 - Math.abs(pointY - leftY)) + (hits * .0005), MAXMOVE);
                isUp = pointY - leftY >= 0;
            }else{
                pointX -= XMOVE;
            }
        }
    }

    if(isUp){
        if(pointY >= 1 - BOX){
            isUp = false;
        }else{
            pointY += YMOVE;
        }
    }else{
        if(pointY <= -1 + BOX){
            isUp = true;
        }else{
            pointY -= YMOVE;
        }
    }



    squarePoints = [];
    squarePoints.push(vec4(pointX - BOX,pointY - BOX, 0, 1));
    squarePoints.push(vec2(0,0));
    squarePoints.push(vec4(pointX + BOX,pointY - BOX, 0, 1));
    squarePoints.push(vec2(1,0));
    squarePoints.push(vec4(pointX + BOX,pointY + BOX, 0, 1));
    squarePoints.push(vec2(1,1));
    squarePoints.push(vec4(pointX - BOX,pointY + BOX, 0, 1));
    squarePoints.push(vec2(0,1));
    squarePoints.push(vec4(-1 + PADDLE - WIDTH,leftY - HEIGHT,0,1));
    squarePoints.push(vec2(0,0));
    squarePoints.push(vec4(-1 + PADDLE + WIDTH,leftY - HEIGHT,0,1));
    squarePoints.push(vec2(1,0));
    squarePoints.push(vec4(-1 + PADDLE + WIDTH,leftY + HEIGHT,0,1));
    squarePoints.push(vec2(1,1));
    squarePoints.push(vec4(-1 + PADDLE - WIDTH,leftY + HEIGHT,0,1));
    squarePoints.push(vec2(0,1));
    squarePoints.push(vec4(1 - PADDLE - WIDTH,rightY - HEIGHT,0,1));
    squarePoints.push(vec2(1,0));
    squarePoints.push(vec4(1 - PADDLE + WIDTH,rightY - HEIGHT,0,1));
    squarePoints.push(vec2(0,0));
    squarePoints.push(vec4(1 - PADDLE + WIDTH,rightY + HEIGHT,0,1));
    squarePoints.push(vec2(0,1));
    squarePoints.push(vec4(1 - PADDLE - WIDTH,rightY + HEIGHT,0,1));
    squarePoints.push(vec2(1,1));
    requestAnimationFrame(render);
}

function buffer(){
    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squarePoints), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program,"vPosition");
    //gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,32,0);
    gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(vPosition);
    if(isTexturing) {
        vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 24, 16);
        gl.enableVertexAttribArray(vTexCoord);
    }

}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    var anisotropic_ext = gl.getExtension('EXT_texture_filter_anisotropic');
    gl.texParameterf(gl.TEXTURE_2D, anisotropic_ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function setFeedback(input){

    leftScoreBoard.innerText = scoreLeft;
    rightScoreBoard.innerText = scoreRight;
}

function render(){
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squarePoints), gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(isTexturing){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTex);
    }
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.drawArrays(gl.TRIANGLE_FAN, 4,4);
    gl.drawArrays(gl.TRIANGLE_FAN, 8,4);
}