'use strict';


const _num_rows = 7;
const _num_columns = _num_rows;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;


// https://stackoverflow.com/a/20339709
function _unique(array_with_duplicates) {
    var array_uniques = [];
    var items_found = {};
    for (var i = 0, l = array_with_duplicates.length; i < l; i++) {
        var stringified = JSON.stringify(array_with_duplicates[i]);
        if (items_found[stringified]) {
            continue;
        }
        array_uniques.push(array_with_duplicates[i]);
        items_found[stringified] = true;
    }
    return array_uniques;
}


function _get_neighbors(position) {
    var x = position[0];
    var y = position[1];

    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ];
}


function _position_outside_board(position) {
    var x = position[0];
    var y = position[1];

    if (x < 1) return true;
    if (x > _num_columns) return true;
    if (y < 1) return true;
    if (y > _num_rows) return true;

    return false;
}


function _get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function _reset(num_rows, num_columns, value) {
    var array = {};
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            array[[row, col]] = value;
        }
    }
    return array;
}


Vue.component('stone', {
    props: ['opacity', 'fill'],
    template: '#stone-template',
})


var app = new Vue({
    el: '#app',
    data: {
        color_current_move: BLACK,
        // there is both colors and board which is possibly redundant
        // the motivation to have both is that "board" keeps the state of the board
        // while "colors" can change based on mouse-over or mouse-out
        // in other words: "colors" is what we see, but "board" is really the board
        // state
        colors: _reset(_num_rows, _num_columns, 'red'),
        board: _reset(_num_rows, _num_columns, EMPTY),
        groups: _reset(_num_rows, _num_columns, 0),
        stone_opacity: _reset(_num_rows, _num_columns, 0.0),
        shadow_opacity: _reset(_num_rows, _num_columns, 0.0),
        shadow_color: _reset(_num_rows, _num_columns, 'red'),
        liberties: {},
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
                this.shadow_color[[x, y]] = this.color(this.color_current_move);
                this.shadow_opacity[[x, y]] = 0.5;
            }
        },
        mouse_out: function(x, y) {
            this.shadow_opacity[[x, y]] = 0.0;
        },
        _switch_player: function() {
            switch (this.color_current_move) {
                case BLACK:
                    this.color_current_move = WHITE;
                    break;
                case WHITE:
                    this.color_current_move = BLACK;
                    break;
            }
        },
        pass: function() {
            this._switch_player();
        },
        click: function(x, y) {
            if (this.board[[x, y]] == EMPTY) {
                this.board[[x, y]] = this.color_current_move;
                this.colors[[x, y]] = this.color(this.color_current_move);
                this.stone_opacity[[x, y]] = 1.0;
                this._compute_groups();
                this._switch_player();
            }
        },
        reset: function() {
            this.colors = _reset(_num_rows, _num_columns, 'red');
            this.board = _reset(_num_rows, _num_columns, EMPTY);
            this.groups = _reset(_num_rows, _num_columns, 0);
            this.stone_opacity = _reset(_num_rows, _num_columns, 0.0),
                this.shadow_opacity = _reset(_num_rows, _num_columns, 0.0),
                this.liberties = {};
        },
        random: function() {
            this.reset();
            for (var row = 1; row <= _num_rows; row++) {
                for (var col = 1; col <= _num_columns; col++) {
                    var i = _get_random_int(0, 2);
                    this.board[[row, col]] = i;
                    this.colors[[row, col]] = this.color(i);
                    if (i > 0) {
                        this.stone_opacity[[row, col]] = 1.0;
                    }
                }
            }
            this._compute_groups();
        },
        _visit_neighbor: function(neighbor, current_color, current_group) {
            // skip if neighbor is outside
            if (_position_outside_board(neighbor)) {
                return;
            }

            // skip if we have already visited this stone
            if (this.groups[neighbor] > 0) {
                return;
            }

            // if neighbor empty, add to the liberties of this group
            if (this.board[neighbor] == EMPTY) {
                if (current_group in this.liberties) {
                    this.liberties[current_group].push(neighbor);
                } else {
                    this.liberties[current_group] = [neighbor];
                }
                // remove duplicates
                this.liberties[current_group] = _unique(this.liberties[current_group]);
                return;
            }

            // neighbor has different color, so skip
            if (this.board[neighbor] != current_color) {
                return;
            }

            // neighbor has same color, add it to this group
            this.groups[neighbor] = current_group;

            for (var _neighbor of _get_neighbors(neighbor)) {
                this._visit_neighbor(_neighbor, current_color, current_group);
            }
        },
        _compute_groups: function() {
            this.groups = _reset(_num_rows, _num_columns, 0);
            this.liberties = {};

            var current_group = 1;
            for (var row = 1; row <= _num_rows; row++) {
                for (var col = 1; col <= _num_columns; col++) {
                    var position = [col, row];

                    // skip if empty
                    if (this.board[position] == EMPTY) {
                        continue;
                    }

                    // skip if we have already visited this stone
                    if (this.groups[position] > 0) {
                        continue;
                    }

                    var current_color = this.board[position];

                    for (var neighbor of _get_neighbors(position)) {
                        this._visit_neighbor(neighbor, current_color, current_group);
                    }

                    this.groups[position] = current_group;
                    current_group++;
                }
            }
        },
        color: function(n) {
            switch (n) {
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