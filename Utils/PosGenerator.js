
const boardWidth = 100;
const boardHeight = 100;

const boxWidth = boardWidth / 15;
const boxHeight = boardHeight / 15;

// convert a box pos to cords 
const mapToScreenCoords = (gridX, gridY) => {
  return {
    x: parseFloat(((gridX * boxWidth) + (boxWidth / 2)).toFixed(2)),
    y: parseFloat(((gridY * boxHeight) + (boxHeight / 2)).toFixed(2))
  };
};

const generateMainPath = () => {
  const gridPath = [];
  // start from green
  let x = 6, y = 13;
  gridPath.push({ x, y });

  // moves after green starting
  const moves = [
    { dx: 0, dy: -1, steps: 4 },
    { dx: -1, dy: -1, steps: 1 }, 
    { dx: -1, dy: 0, steps: 5 },  
    { dx: 0, dy: -1, steps: 2 },  
    { dx: 1, dy: 0, steps: 5 },   
    { dx: 1, dy: -1, steps: 1 },  
    { dx: 0, dy: -1, steps: 5 },  
    { dx: 1, dy: 0, steps: 2 },   
    { dx: 0, dy: 1, steps: 5 },   
    { dx: 1, dy: 1, steps: 1 },   
    { dx: 1, dy: 0, steps: 5 },   
    { dx: 0, dy: 1, steps: 2 },   
    { dx: -1, dy: 0, steps: 5 },  
    { dx: -1, dy: 1, steps: 1 },  
    { dx: 0, dy: 1, steps: 5 },   
    { dx: -1, dy: 0, steps: 1 },
  ];

  for (let move of moves) {
    for (let i = 0; i < move.steps; i++) {
      x += move.dx;
      y += move.dy;
      gridPath.push({ x, y });
    }
  }

  return gridPath.map(pos => mapToScreenCoords(pos.x, pos.y));
};

const generateAllLegendPaths = () => {
  const legendConfigs = {
    green:  { startX: 7, startY: 13, dx: 0,  dy: -1, finishX: 7,   finishY: 7.5 },
    yellow: { startX: 1, startY: 7,  dx: 1,  dy: 0,  finishX: 6.5, finishY: 7   },
    blue:   { startX: 7, startY: 1,  dx: 0,  dy: 1,  finishX: 7,   finishY: 6.5 },
    red:    { startX: 13, startY: 7, dx: -1, dy: 0,  finishX: 7.5, finishY: 7   }
  };

  const allPaths = [];
  
  const orderedColors = ["green", "yellow", "blue", "red"];

  for (const color of orderedColors) {
    const config = legendConfigs[color];
    const gridPath = [];

    for (let i = 0; i <= 6; i++) {
      if (i === 6) {
        gridPath.push({ x: config.finishX, y: config.finishY });
      } else {
        gridPath.push({
          x: config.startX + (config.dx * i),
          y: config.startY + (config.dy * i)
        });
      }
    }
    allPaths.push(gridPath.map(pos => mapToScreenCoords(pos.x, pos.y)));
  }

  return allPaths;
};

const mainCords = generateMainPath();
console.log(mainCords)
const legendCords = generateAllLegendPaths();
console.log(legendCords)