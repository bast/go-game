'use strict';


const _num_rows = 20;
const _num_columns = 20;


function _reset_colors(num_rows, num_columns, color) {
    var colors = {};
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_columns; col++) {
            colors[[row, col]] = "fill: " + color + ";";
        }
    }
    return colors;
}


var app = new Vue({
    el: '#app',
    data: {
        last_mouse_over: "none",
        last_mouse_out: "none",
        last_click: "none",
        colors: _reset_colors(_num_rows, _num_columns, 'blue')
    },
    computed: {
        // this is a bit of a hack, will clean this up later
        // I did this because I did not know how to have these
        // below data and at the same time use them as arguments
        // in _reset_colors
        num_rows: function() {
            return _num_rows;
        },
        num_columns: function() {
            return _num_columns;
        }
    },
    methods: {
        mouse_over: function(x, y) {
            this.colors[[x, y]] = "fill: orange;";
            this.last_mouse_over = '(' + x + ', ' + y + ')';
        },
        mouse_out: function(x, y) {
            if (this.colors[[x, y]] == "fill: orange;") {
                this.colors[[x, y]] = "fill: blue;";
            }
            this.last_mouse_out = '(' + x + ', ' + y + ')';
        },
        click: function(x, y) {
            this.colors[[x, y]] = "fill: red;";
            this.last_click = '(' + x + ', ' + y + ')';
        }
    }
})
