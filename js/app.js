'use strict';


const _num_rows = 20;
const _num_columns = 20;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;


function _reset(num_rows, num_columns, value) {
    var array = {};
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            array[[row, col]] = value;
        }
    }
    return array;
}


var app = new Vue({
    el: '#app',
    data: {
        last_mouse_over: "none",
        last_mouse_out: "none",
        last_click: "none",
        color_current_move: BLACK,
        colors: _reset(_num_rows, _num_columns, '#d6b489'),
        board: _reset(_num_rows, _num_columns, EMPTY),
    },
    computed: {
        // this is a bit of a hack, will clean this up later
        // I did this because I did not know how to have these
        // below data and at the same time use them as arguments
        // in _reset
        num_rows: function() {
            return _num_rows;
        },
        num_columns: function() {
            return _num_columns;
        }
    },
    methods: {
        mouse_over: function(x, y) {
            if (this.board[[x, y]] == EMPTY) {
                switch(this.color_current_move) {
                  case BLACK:
                    this.colors[[x, y]] = '#808080';
                    break;
                  case WHITE:
                    this.colors[[x, y]] = '#e0e0e0';
                    break;
                }
            }
            this.last_mouse_over = '(' + x + ', ' + y + ')';
        },
        mouse_out: function(x, y) {
            this.colors[[x, y]] = this.color(this.board[[x, y]]);
            this.last_mouse_out = '(' + x + ', ' + y + ')';
        },
        click: function(x, y) {
            if (this.board[[x, y]] == EMPTY) {
                this.board[[x, y]] = this.color_current_move;
                this.colors[[x, y]] = this.color(this.color_current_move);
                switch(this.color_current_move) {
                  case BLACK:
                    this.color_current_move = WHITE;
                    break;
                  case WHITE:
                    this.color_current_move = BLACK;
                    break;
                }
            }
            this.last_click = '(' + x + ', ' + y + ')';
        },
        reset: function() {
            this.colors = _reset(_num_rows, _num_columns, '#d6b489');
            this.board = _reset(_num_rows, _num_columns, EMPTY);
        },
        color: function(n) {
            switch(n) {
              case BLACK:
                return 'black';
              case WHITE:
                return 'white';
              default:
                return '#d6b489';
            }
        }
    }
})
