const c = (val) => `calc(var(--cell-size) * ${val})`;

// Defines the top/left CSS properties for each of the 76 possible piece positions.
// 0-51: Main track
// 52+: Home paths for red, green, yellow, blue
export const PATH_COORDINATES = [
  // Main track (52 positions)
  // Red Path -> Green Entrance
  { top: c(6), left: c(1) },   // 0 - Red Start
  { top: c(6), left: c(2) },   // 1
  { top: c(6), left: c(3) },   // 2
  { top: c(6), left: c(4) },   // 3
  { top: c(6), left: c(5) },   // 4
  { top: c(5), left: c(6) },   // 5
  { top: c(4), left: c(6) },   // 6
  { top: c(3), left: c(6) },   // 7
  { top: c(2), left: c(6) },   // 8
  { top: c(1), left: c(6) },   // 9
  { top: c(0), left: c(6) },   // 10
  { top: c(0), left: c(7) },   // 11
  { top: c(0), left: c(8) },   // 12 - Green Entrance
  // Green Path -> Yellow Entrance
  { top: c(1), left: c(8) },   // 13 - Green Start
  { top: c(2), left: c(8) },   // 14
  { top: c(3), left: c(8) },   // 15
  { top: c(4), left: c(8) },   // 16
  { top: c(5), left: c(8) },   // 17
  { top: c(6), left: c(9) },   // 18
  { top: c(6), left: c(10) },  // 19
  { top: c(6), left: c(11) },  // 20
  { top: c(6), left: c(12) },  // 21
  { top: c(6), left: c(13) },  // 22
  { top: c(6), left: c(14) },  // 23
  { top: c(7), left: c(14) },  // 24
  { top: c(8), left: c(14) },  // 25 - Yellow Entrance
  // Yellow Path -> Blue Entrance
  { top: c(8), left: c(13) },  // 26 - Yellow Start
  { top: c(8), left: c(12) },  // 27
  { top: c(8), left: c(11) },  // 28
  { top: c(8), left: c(10) },  // 29
  { top: c(8), left: c(9) },   // 30
  { top: c(9), left: c(8) },   // 31
  { top: c(10), left: c(8) },  // 32
  { top: c(11), left: c(8) },  // 33
  { top: c(12), left: c(8) },  // 34
  { top: c(13), left: c(8) },  // 35
  { top: c(14), left: c(8) },  // 36
  { top: c(14), left: c(7) },  // 37
  { top: c(14), left: c(6) },  // 38 - Blue Entrance
  // Blue Path -> Red Entrance
  { top: c(13), left: c(6) },  // 39 - Blue Start
  { top: c(12), left: c(6) },  // 40
  { top: c(11), left: c(6) },  // 41
  { top: c(10), left: c(6) },  // 42
  { top: c(9), left: c(6) },   // 43
  { top: c(8), left: c(5) },   // 44
  { top: c(8), left: c(4) },   // 45
  { top: c(8), left: c(3) },   // 46
  { top: c(8), left: c(2) },   // 47
  { top: c(8), left: c(1) },   // 48
  { top: c(8), left: c(0) },   // 49
  { top: c(7), left: c(0) },   // 50
  { top: c(6), left: c(0) },   // 51 - Red Entrance

  // Home Paths (6 positions per color)
  // Red Home Path (52-57) - Vertical path from the bottom
  { top: c(13), left: c(7) }, { top: c(12), left: c(7) }, { top: c(11), left: c(7) }, { top: c(10), left: c(7) }, { top: c(9), left: c(7) }, { top: c(8), left: c(7) },
  // Green Home Path (58-63) - Horizontal path from the left
  { top: c(7), left: c(1) }, { top: c(7), left: c(2) }, { top: c(7), left: c(3) }, { top: c(7), left: c(4) }, { top: c(7), left: c(5) }, { top: c(7), left: c(6) },
  // Yellow Home Path (64-69) - Vertical path from the top
  { top: c(1), left: c(7) }, { top: c(2), left: c(7) }, { top: c(3), left: c(7) }, { top: c(4), left: c(7) }, { top: c(5), left: c(7) }, { top: c(6), left: c(7) },
  // Blue Home Path (70-75) - Horizontal path from the right
  { top: c(7), left: c(13) }, { top: c(7), left: c(12) }, { top: c(7), left: c(11) }, { top: c(7), left: c(10) }, { top: c(7), left: c(9) }, { top: c(7), left: c(8) },
];
