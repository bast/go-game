'use strict';


const EMPTY = 0;


// https://stackoverflow.com/a/20339709
// returns array without duplicates
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


function _compute_groups(board, num_rows, num_columns) {
    var position_to_group = _reset(num_rows, num_columns, 0);
    var liberties = {};
    var current_group = 1;
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            var position = [col, row];

            // skip if empty
            if (board[position] == EMPTY) {
                continue;
            }

            // skip if we have already visited this stone
            if (position_to_group[position] > 0) {
                continue;
            }

            var current_color = board[position];

            for (var neighbor of _get_neighbors(position)) {
                var t = _visit_neighbor(board,
                                        num_rows,
                                        num_columns,
                                        neighbor,
                                        current_color,
                                        current_group,
                                        liberties,
                                        position_to_group);
                liberties = t[0];
                position_to_group = t[1];
            }

            position_to_group[position] = current_group;
            current_group++;
        }
    }
    var num_groups = current_group - 1;

    console.log("\nliberties:");
    for (var i = 1; i <= num_groups; i++) {
        console.log(i);
        for (var liberty of liberties[i]) {
            console.log(liberty);
        }
    }

    return [num_groups, position_to_group, liberties];
}


function _remove_group(board,
                       num_rows,
                       num_columns,
                       color_current_move,
                       group,
                       position_to_group) {
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            if (position_to_group[[row, col]] == group) {
                // no self-capture
                if (board[[row, col]] != color_current_move) {
                    board[[row, col]] = EMPTY;
                }
            }
        }
    }
    return board;
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


function _visit_neighbor(board,
                         num_rows,
                         num_columns,
                         neighbor,
                         current_color,
                         current_group,
                         liberties,
                         position_to_group) {
    // skip if neighbor is outside
    if (_position_outside_board(neighbor, num_rows, num_columns)) {
        return [liberties, position_to_group];
    }

    // skip if we have already visited this stone
    if (position_to_group[neighbor] > 0) {
        return [liberties, position_to_group];
    }

    // if neighbor empty, add to the liberties of this group
    if (board[neighbor] == EMPTY) {
        if (current_group in liberties) {
            liberties[current_group].push(neighbor);
        } else {
            liberties[current_group] = [neighbor];
        }
        // remove duplicates
        liberties[current_group] = _unique(liberties[current_group]);
        return [liberties, position_to_group];
    }

    // neighbor has different color, so skip
    if (board[neighbor] != current_color) {
        return [liberties, position_to_group];
    }

    // neighbor has same color, add it to this group
    position_to_group[neighbor] = current_group;

    for (var _neighbor of _get_neighbors(neighbor)) {
        var t = _visit_neighbor(board,
                                num_rows,
                                num_columns,
                                _neighbor,
                                current_color,
                                current_group,
                                liberties,
                                position_to_group);
        liberties = t[0];
        position_to_group = t[1];
    }
    return [liberties, position_to_group];
}


function _position_outside_board(position, num_rows, num_columns) {
    var x = position[0];
    var y = position[1];

    if (x < 1) return true;
    if (x > num_columns) return true;
    if (y < 1) return true;
    if (y > num_rows) return true;

    return false;
}


function _find_groups_without_liberties(num_groups, liberties) {
    var r = [];
    for (var group = 1; group <= num_groups; group++) {
        // liberties only contains groups with at
        // least 1 liberty
        if (!(group in liberties)) {
            r.push(group);
        }
    }
    return r;
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


function _copy_board(old_board, num_rows, num_columns) {
    var new_board = {};
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            new_board[[row, col]] = old_board[[row, col]];
        }
    }
    return new_board;
}


Vue.component('stone', {
    template: '#stone-template',
    props: ['opacity', 'fill'],
})


Vue.component('background', {
    template: '#background-template',
    props: ['col', 'row', 'num_rows'],
    methods: {
        rectangles: function(col, row, dim, num_rows) {
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
                        case num_rows:
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
                case num_rows:
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
                        case num_rows:
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
                        case num_rows:
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
        board_size: 9,
        num_rows: 9,
        num_columns: 9,
        num_colors: 2,
        score: null,
        color_current_move: null,
        board: null,
        shadow_opacity: null,  // shows shadows with possible future stone placement when moving the mouse over the board
        num_consecutive_passes: null,
        num_moves: null,
    },
    created() {
        this.reset();
    },
    methods: {
        mouse_over: function(x, y) {
            this.shadow_opacity[[x, y]] = 0.5;
        },
        mouse_out: function(x, y) {
            this.shadow_opacity[[x, y]] = 0.0;
        },
        _switch_player: function() {
            this.color_current_move += 1;
            if (this.color_current_move > this.num_colors) {
                this.color_current_move = 1;
            }
        },
        pass: function() {
            this.num_consecutive_passes += 1;
            this.num_moves += 1;
            this._switch_player();
        },
        click: function(x, y) {
            if (this.board[[x, y]] != EMPTY) {
                // we cannot place a stone on another stone
                return;
            }

            // we take a copy since the move may not be
            // allowed - only once we know this is a legal move
            // we update this.board
            var temp_board = _copy_board(this.board, this.num_rows, this.num_columns);
            temp_board[[x, y]] = this.color_current_move;

            var t = _compute_groups(temp_board, this.num_rows, this.num_columns);
            var num_groups = t[0];
            var position_to_group = t[1];
            var liberties = t[2];

            console.log("\nposition_to_group:");
            for (var i = 0; i < this.num_columns; i++) {
                let s = i + ':';
                for (var j = 0; j < this.num_rows; j++) {
                    s += ' ' + position_to_group[[j+1, i+1]];
                }
                console.log(s);
            }

            var current_group = position_to_group[[x, y]]
            var groups_without_liberties = _find_groups_without_liberties(num_groups, liberties);
            if (groups_without_liberties.length == 1) {
                if (groups_without_liberties[0] == current_group) {
                    // self-capture is not allowed
                    return;
                }
            }

            for (var group of groups_without_liberties) {
                temp_board = _remove_group(temp_board,
                                           this.num_rows,
                                           this.num_columns,
                                           this.color_current_move,
                                           group,
                                           position_to_group);
            }

            this.num_consecutive_passes = 0;
            this.num_moves += 1;
            this._switch_player();
            this.board = _copy_board(temp_board, this.num_rows, this.num_columns);
        },
        reset: function() {
            this.num_rows = this.board_size;
            this.num_columns = this.board_size;
            this.score = Array(this.num_colors).fill(0);
            this.color_current_move = 1;
            this.board = _reset(this.num_rows, this.num_columns, EMPTY);
            this.shadow_opacity = _reset(this.num_rows, this.num_columns, 0.0);
            this.num_consecutive_passes = 0;
            this.num_moves = 1;
        },
        color: function(n) {
            let colors = ['black', 'white'];
            return colors[n - 1];
        }
    }
})
