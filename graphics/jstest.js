var board = document.querySelector('.board');
var background = document.querySelector('.background');
var markings = document.querySelector('.markings');
var stones = document.querySelector('.stones');

var template = document.getElementById('board-template');


function Board(width, height) {
    var self = {};

    self.width = width;
    self.height = height;

    var scale = 100;
    var margin = scale / 2;

    function screenX(x) {
        return margin + (x * scale);
    }
    
    function screenY(y) {
        // Why -1?
        var invY = margin + ((self.height - y - 1) * scale);
        return invY;
    }

    function placeStar(x, y) {
        var star = template.querySelector('.star').cloneNode(true);
        star.setAttribute('cx', screenX(x));
        star.setAttribute('cy', screenY(y));
        markings.appendChild(star);
    }

    function drawBoard() {
        var x, y, box;

        var wood = template.querySelector('.wood').cloneNode(true);
        wood.setAttribute('x', 0);
        wood.setAttribute('y', 0);
        wood.setAttribute('width', width * scale);
        wood.setAttribute('height', height * scale);
        background.appendChild(wood);
        
        var tbox = template.querySelector('.line');
        for (y = 0; y < (height - 1); y++) {
            for (x = 0; x < (width - 1); x++) {
                box = tbox.cloneNode(true);
                // y+1 here because the Y coordinates are flipped.
                box.setAttribute('x', screenX(x))
                box.setAttribute('y', screenY(y+1))
                box.setAttribute('width', scale)
                box.setAttribute('height', scale)
                markings.appendChild(box)
            }
        }
        
        // Todo: these vary by board size.
        placeStar(3, 3);
        placeStar(3, 9);
        placeStar(3, 15);
        
        placeStar(9, 3);
        placeStar(9, 9);
        placeStar(9, 15);
        
        placeStar(15, 3);
        placeStar(15, 9);
        placeStar(15, 15);
        
        var viewBox = '0 0 ' + (width * scale) + '  ' + (height * scale);
        board.setAttribute('viewBox', viewBox);
    }

    self.placeStone = function(x, y, color) {        
        var stone = template.querySelector('.stone').cloneNode(true);
        var tr = 'translate(' + screenX(x) + ', ' + screenY(y) + ')';
        stone.setAttribute('transform', tr);
        stone.setAttribute('class', 'stone ' + color);
        stones.appendChild(stone);
    }

    drawBoard();

    return self;
}


board = Board(19, 19);
board.placeStone(15, 15, 'black');
board.placeStone(3, 3, 'white');
board.placeStone(15, 2, 'black');
board.placeStone(3, 15, 'white');
board.placeStone(5, 2, 'black');
board.placeStone(8, 3, 'white');


// placeStone(, ,'white');
/*
laceStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
placeStone(, ,'white');
placeStone(, ,'black');
*/
