var board = document.querySelector('.board');
var background = document.querySelector('.background');
var stones = document.querySelector('.stones');

var template = document.getElementById('board-template');


function placeStar(x, y)
{
    var star = template.querySelector('.star').cloneNode(true);
    star.setAttribute('cx', 50 + x * 100);
    star.setAttribute('cy', 50 + y * 100);
    background.appendChild(star);
}

function drawBoard(width, height) {
    var x, y, box;

    var wood = template.querySelector('.wood').cloneNode(true);
    wood.setAttribute('x', 0);
    wood.setAttribute('y', 0);
    wood.setAttribute('width', width * 100);
    wood.setAttribute('height', height * 100);
    background.appendChild(wood);

    var tbox = template.querySelector('.line');
    for (y = 0; y < (height - 1); y++) {
        for (x = 0; x < (width - 1); x++) {
            box = tbox.cloneNode(true);
            box.setAttribute('x', 50 + x * 100)
            box.setAttribute('y', 50 + (height - y - 2) * 100)  // Why -2?
            box.setAttribute('width', 100)
            box.setAttribute('height', 100)
            background.appendChild(box)
        }
    }

    placeStar(3, 3);
    placeStar(3, 9);
    placeStar(3, 15);

    placeStar(9, 3);
    placeStar(9, 9);
    placeStar(9, 15);

    placeStar(15, 3);
    placeStar(15, 9);
    placeStar(15, 15);

    var vw = width * 100;
    var vh = height * 100;
    var viewBox = '0 0 ' + vw + '  ' + vh;
    board.setAttribute('viewBox', viewBox);
}

function placeStone(x, y, color)
{
    var stone = template.querySelector('.stone').cloneNode(true);
    var screenX = 50 + x * 100;
    var screenY = 50 + y * 100;
    stone.setAttribute('transform', 'translate(' + screenX + ', ' + screenY + ')');
    stone.setAttribute('class', 'stone ' + color);
    console.log(stone);
    stones.appendChild(stone);
}

drawBoard(19, 19);
placeStone(10, 6, 'black');
placeStone(2, 9, 'white');
placeStone(4, 8, 'black');
