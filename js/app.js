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
    template: '#stone-template',
    props: ['opacity', 'fill'],
})


Vue.component('background', {
    template: '#background-template',
    props: ['col', 'row'],
    methods: {
        rectangles: function(col, row, dim) {
            var r = [];
            var v = 1.0;
            var w = 2.0 * v;
            var l = 0.5 * dim;
            switch (row) {
                case 1:
                    switch (col) {
                        case 1:
                            r.push({
                                x: l,
                                y: l,
                                width: l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: l,
                                width: w,
                                height: l
                            });
                            break;
                        case _num_rows:
                            r.push({
                                x: 0,
                                y: l,
                                width: l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: l,
                                width: w,
                                height: l
                            });
                            break;
                        default:
                            r.push({
                                x: 0,
                                y: l,
                                width: 2.0 * l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: l,
                                width: v,
                                height: l
                            });
                    }
                    break;
                case _num_rows:
                    switch (col) {
                        case 1:
                            r.push({
                                x: l,
                                y: l,
                                width: l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: 0,
                                width: w,
                                height: l
                            });
                            break;
                        case _num_rows:
                            r.push({
                                x: 0,
                                y: l,
                                width: l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: 0,
                                width: w,
                                height: l
                            });
                            break;
                        default:
                            r.push({
                                x: 0,
                                y: l,
                                width: 2.0 * l,
                                height: w
                            });
                            r.push({
                                x: l,
                                y: 0,
                                width: v,
                                height: l
                            });
                    }
                    break;
                default:
                    switch (col) {
                        case 1:
                            r.push({
                                x: l,
                                y: 0,
                                width: w,
                                height: 2.0 * l
                            });
                            r.push({
                                x: l,
                                y: l,
                                width: l,
                                height: v
                            });
                            break;
                        case _num_rows:
                            r.push({
                                x: l,
                                y: 0,
                                width: w,
                                height: 2.0 * l
                            });
                            r.push({
                                x: 0,
                                y: l,
                                width: l,
                                height: v
                            });
                            break;
                        default:
                            r.push({
                                x: 0,
                                y: l,
                                width: 2.0 * l,
                                height: v
                            });
                            r.push({
                                x: l,
                                y: 0,
                                width: v,
                                height: 2.0 * l
                            });
                    }
            }
            return r;
        },
    }
})


var app = new Vue({
    el: '#app',
    data: {
        color_current_move: BLACK,
        board: _reset(_num_rows, _num_columns, EMPTY),
        groups: _reset(_num_rows, _num_columns, 0),
        num_groups: 0,
        shadow_opacity: _reset(_num_rows, _num_columns, 0.0),
        liberties: {},
        num_consecutive_passes: 0,
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
            this.num_consecutive_passes += 1;
            this._switch_player();
        },
        click: function(x, y) {
            // we cannot place a stone on another stone
            if (this.board[[x, y]] != EMPTY) {
                return;
            }
            this.board[[x, y]] = this.color_current_move;
            this._compute_groups();
            for (var group of this._groups_without_liberties()) {
                this._remove_group(group);
            }
            this.num_consecutive_passes = 0;
            this._switch_player();
        },
        reset: function() {
            this.board = _reset(_num_rows, _num_columns, EMPTY);
            this.groups = _reset(_num_rows, _num_columns, 0);
            this.num_groups = 0;
            this.shadow_opacity = _reset(_num_rows, _num_columns, 0.0);
            this.liberties = {};
            this.num_consecutive_passes = 0;
        },
        random: function() {
            this.reset();
            for (var row = 1; row <= _num_rows; row++) {
                for (var col = 1; col <= _num_columns; col++) {
                    var i = _get_random_int(0, 2);
                    this.board[[row, col]] = i;
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
            this.num_groups = current_group - 1;
        },
        _remove_group: function(group) {
            for (var row = 1; row <= this.num_rows; row++) {
                for (var col = 1; col <= this.num_columns; col++) {
                    if (this.groups[[row, col]] == group) {
                        // no self-capture
                        if (this.board[[row, col]] != this.color_current_move) {
                            this.board[[row, col]] = EMPTY;
                        }
                    }
                }
            }
        },
        _groups_without_liberties: function() {
            var r = [];
            for (var group = 1; group <= this.num_groups; group++) {
                // this.liberties only contains groups with at
                // least 1 liberty
                if (!(group in this.liberties)) {
                    r.push(group);
                }
            }
            return r;
        },
        color: function(n) {
            switch (n) {
                case BLACK:
                    return 'black';
                case WHITE:
                    return 'white';
            }
        }
    }
})
