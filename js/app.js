'use strict';


const EMPTY = 0;


// https://stackoverflow.com/a/7616484
function _hash(num_rows, num_columns, board) {

    var s = '';
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            var position = [col, row];
            s += board[position].toString();
        }
    }

    var hash = 0;
    if (s.length === 0) return hash;

    for (var i = 0; i < s.length; i++) {
        var chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};


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


function _update_score(num_colors, num_rows, num_columns, board, groups, position_to_group) {

    var score = {};
    var areas = {};

    for (var color = 1; color <= num_colors; color++) {
        score[color] = 0;
        areas[color] = [];
    }

    // first we find empty areas which only touch one color
    for (var key in groups) {
        var color = groups[key]["color"];
        if (color == EMPTY) {
            var bounding_colors = Object.keys(groups[key]["bounds"]);
            if (bounding_colors.length == 1) {
                areas[bounding_colors[0]].push(Number(key));
            }
        }
    }

    // then we add all stones and areas which belong to one color
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            var position = [col, row];
            if (board[position] == EMPTY) {
                var current_group = position_to_group[position];
                for (var color = 1; color <= num_colors; color++) {
                    if (areas[color].includes(current_group)) {
                        score[color] += 1;
                    }
                }
            } else {
                score[board[position]] += 1;
            }
        }
    }

    return score;
}


function _compute_groups(board, num_rows, num_columns) {
    var groups = {};
    var position_to_group = _reset(num_rows, num_columns, 0);

    var current_group = 1;
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            var position = [col, row];

            // skip if this position already belongs to a group
            if (position_to_group[position] > 0) {
                continue;
            }

            if (!(current_group in groups)) {
                groups[current_group] = {};
                groups[current_group]["bounds"] = {};
            }

            var current_color = board[position];
            groups[current_group]["color"] = current_color;

            for (var neighbor of _get_neighbors(position)) {
                var t = _visit_neighbor(board,
                    num_rows,
                    num_columns,
                    neighbor,
                    current_color,
                    current_group,
                    groups,
                    position_to_group);
                groups = t[0];
                position_to_group = t[1];
            }

            position_to_group[position] = current_group;
            current_group++;
        }
    }

    return [groups, position_to_group];
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
    groups,
    position_to_group) {

    // skip if neighbor is outside
    if (_position_outside_board(neighbor, num_rows, num_columns)) {
        return [groups, position_to_group];
    }

    // if neighbor is different, add to the bounds of this group
    var neighbor_color = board[neighbor];
    if (neighbor_color != current_color) {

        if (neighbor_color in groups[current_group]["bounds"]) {
            groups[current_group]["bounds"][neighbor_color].push(neighbor);
        } else {
            groups[current_group]["bounds"][neighbor_color] = [neighbor];
        }

        // remove duplicates
        groups[current_group]["bounds"][neighbor_color] = _unique(groups[current_group]["bounds"][neighbor_color]);

        return [groups, position_to_group];
    }

    // skip if this position already belongs to a group
    if (position_to_group[neighbor] > 0) {
        return [groups, position_to_group];
    }

    // neighbor has same color, add it to this group
    // and visit its neighbors
    position_to_group[neighbor] = current_group;
    for (var _neighbor of _get_neighbors(neighbor)) {
        var t = _visit_neighbor(board,
            num_rows,
            num_columns,
            _neighbor,
            current_color,
            current_group,
            groups,
            position_to_group);
        groups = t[0];
        position_to_group = t[1];
    }

    return [groups, position_to_group];
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


function _find_groups_without_liberties(groups) {
    var r = [];
    for (var key in groups) {
        if (groups[key]["color"] > EMPTY) {
            if (!(EMPTY in groups[key]["bounds"])) {
                r.push(key);
            }
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
        num_players: 2,
        num_colors: 2,
        score: {
            "1": 0,
            "2": 0
        },
        show_score: false,
        color_current_move: null,
        board: null,
        hashes: [],
        shadow_opacity: null, // shows shadows with possible future stone placement when moving the mouse over the board
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

            // ko rule
            var hash = _hash(this.num_rows, this.num_columns, temp_board);
            if (this.hashes.includes(hash)) {
                return;
            }

            var t = _compute_groups(temp_board, this.num_rows, this.num_columns);
            var groups = t[0];
            var position_to_group = t[1];

            var groups_without_liberties = _find_groups_without_liberties(groups);

            if (groups_without_liberties.length == 1) {
                var current_group = position_to_group[[x, y]]
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

            var t = _compute_groups(this.board, this.num_rows, this.num_columns);
            var groups = t[0];
            var position_to_group = t[1];
            this.score = _update_score(this.num_colors, this.num_rows, this.num_columns, this.board, groups, position_to_group);
            this.hashes.push(hash);
        },
        reset: function() {
            this.num_rows = parseInt(this.board_size);
            this.num_columns = parseInt(this.board_size);
            this.num_colors = parseInt(this.num_players);
            this.score = {};
            for (var color = 1; color <= this.num_colors; color++) {
                this.score[color] = 0;
            }
            this.color_current_move = 1;
            this.board = _reset(this.num_rows, this.num_columns, EMPTY);
            this.hashes = [];
            this.shadow_opacity = _reset(this.num_rows, this.num_columns, 0.0);
            this.num_consecutive_passes = 0;
            this.num_moves = 1;
        },
        color: function(n) {
            let colors = ['black', 'white', 'red', 'blue'];
            return colors[n - 1];
        }
    }
})