import random
from collections import namedtuple, defaultdict, deque

Point = namedtuple('Point', ['x', 'y'])
Size = namedtuple('Size', ['w', 'h'])

EMPTY = 0
BLACK = 1
WHITE = 2

LETTERS = 'ABCDEFGHJKLMNOPQRST'
COLOR_CHARS = ' [='


class Group:
    def __init__(self, color):
        self.color = color
        self.points = set()
        self.liberties = set()
        
    @property
    def is_alive(self):
        return len(self.liberties) > 0

    @property
    def is_dead(self):
        return len(self.liberties) == 0

    def __len__(self):
        return len(self.points)

    def __repr__(self):
        return '<group color={} {} points {} liberties>'.format(
            self.color, len(self.points), len(self.liberties))


class Board:
    def __init__(self, size):
        self.size = size
        self.points = {}

    def random_fill(self, seed=None):
        rand = random.Random(seed)

        for point in self.iter_points():
            self.points[point] = rand.choice([EMPTY, BLACK, WHITE])

    def is_inside(self, point):
        return 0 <= point.x < self.size.w and 0 <= point.y < self.size.h

    def get_color(self, point):
        return self.points.get(point, 0)

    def get_neighbours(self, point):
        x, y = point

        points = [Point(x-1, y), Point(x+1, y), Point(x, y-1), Point(x, y+1)]
        points = [p for p in points if self.is_inside(p)]

        return points

    def iter_points(self):
        for x in range(self.size.w):
            for y in range(self.size.h):
                yield Point(x, y)

    def get_groups(self):
        groups = []
        groups_by_point = {}

        for point in self.iter_points():
            if point in groups_by_point:
                continue

            color = self.get_color(point)
            if color == EMPTY:
                continue

            group = Group(color)
            groups.append(group)

            todo = [point]
            while todo:
                point = todo.pop()
                color = self.points[point]

                if point in groups_by_point:
                    continue
                elif color == EMPTY:
                    group.liberties.add(point)
                elif color == group.color:
                    group.points.add(point)
                    groups_by_point[point] = group
                    todo.extend(self.get_neighbours(point))

        return groups, groups_by_point
                
    def print(self, point_func=None):
        if point_func is None:
            def point_func(point):
                return COLOR_CHARS[self.get_color(point)]

        print()
        for y in range(self.size.h):
            line = []
            for x in range(self.size.w):
                line.append(point_func(Point(x, y)))

            print('  ' + ' '.join(line))
        print()
                

board = Board(Size(19, 19))
board.random_fill(seed=None)
print('Board:')
board.print()


def get_point_liberties(point):
    try:
        group = groups_by_point[point]
        if group.is_alive:
            return '.'
        else:
            return COLOR_CHARS[group.color]
            
    except KeyError:
        return ' '

groups, groups_by_point = board.get_groups()
print('Dead groups:')
board.print(get_point_liberties)
