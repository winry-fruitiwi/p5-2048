/**
 *  @author Winry
 *  @date 2022.8.10
 *
 *  Current bug class: Mutation error
 *  Current bug description: Creating a variable from [...grid] and then
 *  operating on it makes the variable before operation look like it's
 *  already been acted on.
 *
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// the 2048 grid represented by a 2D array. Can later be manipulated by tests.
let grid

// has the user won or lost?
let gameFinished = false

// the value required for the user to win
const WINNING_VALUE = 512


function preload() {
    font = loadFont('data/consola.ttf')
}

function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
    numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    grid = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
    ]

    spawnRandomTwo()
    spawnRandomTwo()
    slideTests()
    combineAdjacentTests()
    moveRightTests()
    moveLeftTests()
    createColumn2DGridTests()
    moveUpTests()
    moveDownTests()

    printGrid()
}


function draw() {
    background(234, 34, 24)

    if (frameCount > 3000)
        noLoop()

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.show()
}


// takes in an input 2048 row and outputs a shifted 2048 row, in this case
// shifted to the right. Does not mutate any variables.
function slide(input2048Row) {
    // the output
    let shifted2048Row = [0, 0, 0, 0]

    // the number of numbers encountered in the 2048 grid row so far is part
    // of this variable, which keeps track of where the next integer will be
    // in order to avoid collisions with other numbers in the 2048 grid.
    let nextNumberPos = input2048Row.length - 1

    // iterate through numbers in input
    for (let i = input2048Row.length - 1; i >= 0; i--) {
        let number = input2048Row[i]

        // when we encounter a nonzero number, for now we will shift it to
        // the end and not account for other blocks
        if (number > 0) {
            shifted2048Row[nextNumberPos] = number
            nextNumberPos--
        }
    }

    return shifted2048Row
}


// takes in a 2048 row and outputs a combined 2048 row
function combineAdjacent(input2048Row) {
    // the output, using a trick that almost runs copy() on input2048 row
    let output2048Row = [...input2048Row]

    // iterate from right to left, starting at input2048Row.length - 2. This
    // is equivalent to Python's list[-2]. Check i + 1 and i. If they are
    // the same value, i+1's value is duplicated, and i's value becomes 0
    for (let i = output2048Row.length - 2; i >= 0; i--) {
        if (output2048Row[i] === output2048Row[i + 1]) {
            output2048Row[i+1] *= 2
            output2048Row[i] = 0
        }
    }

    return output2048Row
}


// a for loop that returns whether two lists are equal.
function equateLists(inputList1, inputList2) {
    let list1 = [...inputList1]
    let list2 = [...inputList2]

    if (list1.length !== list2.length) {
        return false
    }

    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) {
            return false
        }
    }
    return true
}


// calls slide(), combineAdjacent(), and then slide() again.
function moveRight(input2048Row) {
    let copied2048Row = [...input2048Row]
    let slid2048Row = slide(copied2048Row)

    let combined2048Row = combineAdjacent(slid2048Row)

    return slide(combined2048Row)
}


// takes in an input 2048 row and calls moveRight on a reversed list
function moveLeft(input2048Row) {
    let copied2048Row = [...input2048Row]
    copied2048Row.reverse()

    let output2048Row = moveRight(copied2048Row)

    output2048Row.reverse()
    return output2048Row
}


// finds a column in a 2D 2048 grid
function getColumn2DGrid(input2048Grid, inputColumnIndex) {
    let grid = [...input2048Grid]

    // a column created by this function
    let outputColumn = []

    for (let row of grid) {
        outputColumn.push(row[inputColumnIndex])
    }

    return outputColumn
}


// takes an input 2048 grid, calls getColumn2DGrid, then moveLeft
function moveUp(input2048Grid, columnToMoveIndex) {
    let grid = [...input2048Grid]

    let column = getColumn2DGrid(grid, columnToMoveIndex)
    return moveLeft([...column])
}


// takes an input 2048 grid, calls getColumn2DGrid, then moveLeft
function moveDown(input2048Grid, columnToMoveIndex) {
    let grid = [...input2048Grid]

    let column = getColumn2DGrid(grid, columnToMoveIndex)
    return moveRight([...column])
}


// spawns a randomly placed 2 in the 2048 grid
function spawnRandomTwo() {
    let randomRowIndex = int(random(grid.length))
    let randomColumnIndex = int(random(grid.length))

    // a limit on the number of times to reroll the random indices
    let numTimesToCheck = 100

    let numTimesCurrentlyChecked = 0
    while (grid[randomRowIndex][randomColumnIndex] !== 0 &&
    numTimesToCheck > numTimesCurrentlyChecked) {
        randomRowIndex = int(random(grid.length))
        randomColumnIndex = int(random(grid.length))

        // console.log(randomRowIndex)
        // console.log(randomColumnIndex)
        numTimesCurrentlyChecked++
    }

    if (numTimesToCheck === numTimesCurrentlyChecked) {
        return
    }
    grid[randomRowIndex][randomColumnIndex] = random([2, 4])
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
        sketch stopped</pre>`)
    }

    if (!gameFinished) {
        if (keyCode === LEFT_ARROW || key === "a") {
            let previousGrid = [...grid]
            console.log(grid)

            for (let i = 0; i < previousGrid.length; i++) {
                previousGrid[i] = moveLeft(previousGrid[i])
            }

            spawnRandomTwo()
            // printGrid()
        }

        if (keyCode === RIGHT_ARROW || key === "d") {
            let previousGrid = [...grid]
            console.log(previousGrid)

            for (let i = 0; i < grid.length; i++) {
                grid[i] = moveRight(grid[i])
            }

            spawnRandomTwo()
            // printGrid()
        }

        if (keyCode === DOWN_ARROW || key === "s") {
            let previousGrid = [...grid]
            console.log(previousGrid)

            for (let i = 0; i < grid.length; i++) {
                let column = moveDown(grid, i)
                // update all columns
                for (let j = 0; j < grid.length; j++) {
                    grid[j][i] = column[j]
                }
            }

            spawnRandomTwo()
            // printGrid()
        }

        if (keyCode === UP_ARROW || key === "w") {
            let previousGrid = [...grid]
            console.log(previousGrid)

            for (let i = 0; i < grid.length; i++) {
                let column = moveUp(grid, i)
                // update all columns
                for (let j = 0; j < grid.length; j++) {
                    grid[j][i] = column[j]
                }
            }

            spawnRandomTwo()
            // printGrid()
        }

        // has the user won?
        for (let row of grid) {
            for (let square of row) {
                if (square === WINNING_VALUE) {
                    noLoop()
                    console.log("You won!")
                    gameFinished = true
                }
            }
        }
    }
}


// prints the 2048 grid
function printGrid() {
    console.clear()

    let printedGridString = ""

    for (let row of grid) {
        printedGridString += JSON.stringify(row) + "\n"
    }

    console.log(printedGridString)
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    show() {
        textFont(font, 14)

        const LEFT_MARGIN = 10
        const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
        const LINE_SPACING = 2
        const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

        /* semi-transparent background */
        fill(0, 0, 0, 10)
        rectMode(CORNERS)
        const TOP_PADDING = 3 /* extra padding on top of the 1st line */
        rect(
            0,
            height,
            width,
            DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
        )

        fill(0, 0, 100, 100) /* white */
        strokeWeight(0)

        for (let index in this.debugMsgList) {
            const msg = this.debugMsgList[index]
            text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
        }
    }
}


// a set of tests for slide()
function slideTests() {
    console.assert(equateLists(slide([2,0,0,0]), [0,0,0,2]))
    console.assert(equateLists(slide([0,2,0,0]), [0,0,0,2]))
    console.assert(equateLists(slide([0,0,2,0]), [0,0,0,2]))
    console.assert(equateLists(slide([0,0,0,2]), [0,0,0,2]))

    console.assert(equateLists(slide([2,2,0,0]), [0,0,2,2]))
    console.assert(equateLists(slide([0,2,4,0]), [0,0,2,4]))
    console.assert(equateLists(slide([0,8,2,0]), [0,0,8,2]))
    console.assert(equateLists(slide([0,0,0,2]), [0,0,0,2]))
}


// a set of tests for combineAdjacent
function combineAdjacentTests() {
    console.assert(equateLists(combineAdjacent([2,2,0,0]), [0,4,0,0]))
    console.assert(equateLists(combineAdjacent([0,4,2,0]), [0,4,2,0]))
    console.assert(equateLists(combineAdjacent([0,8,8,0]), [0,0,16,0]))
    console.assert(equateLists(combineAdjacent([0,0,2,2]), [0,0,0,4]))
    console.assert(equateLists(combineAdjacent([0,2,2,4]), [0,0,4,4]))
}


// a set of tests for moveRight
function moveRightTests() {
    console.assert(equateLists(moveRight([0,0,0,2]), [0,0,0,2]))
    console.assert(equateLists(moveRight([0,0,2,2]), [0,0,0,4]))
    console.assert(equateLists(moveRight([0,2,2,0]), [0,0,0,4]))
    console.assert(equateLists(moveRight([0,4,2,0]), [0,0,4,2]))

    console.assert(equateLists(moveRight([2,2,2,2]), [0,0,4,4]))
    console.assert(equateLists(moveRight([0,2,2,2]), [0,0,2,4]))
    console.assert(equateLists(moveRight([0,2,8,0]), [0,0,2,8]))
    console.assert(equateLists(moveRight([4,4,2,2]), [0,0,8,4]))
}

// a set of tests for moveLeft
function moveLeftTests() {
    console.assert(equateLists(moveLeft([0,0,0,2]), [2,0,0,0]))
    console.assert(equateLists(moveLeft([0,0,2,2]), [4,0,0,0]))
    console.assert(equateLists(moveLeft([0,2,2,0]), [4,0,0,0]))
    console.assert(equateLists(moveLeft([0,4,2,0]), [4,2,0,0]))

    console.assert(equateLists(moveLeft([2,2,2,2]), [4,4,0,0]))
    console.assert(equateLists(moveLeft([0,2,2,2]), [4,2,0,0]))
    console.assert(equateLists(moveLeft([0,2,8,0]), [2,8,0,0]))
    console.assert(equateLists(moveLeft([4,4,2,2]), [8,4,0,0]))
}


// a set of tests for getColumn2DGrid
function createColumn2DGridTests() {
    console.assert(equateLists(getColumn2DGrid([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [1,0,0,0]
    ], 0), [0, 0, 0, 1]))
}


// a set of tests for moveUp
function moveUpTests() {
    console.assert(equateLists(moveUp([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [2,0,0,0]
    ], 0), [2, 0, 0, 0]))
    console.assert(equateLists(moveUp([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [1,1,0,0]
    ], 1), [1, 0, 0, 0]))
    console.assert(equateLists(moveUp([
        [0,0,0,0],
        [0,0,0,0],
        [2,0,0,0],
        [2,0,0,0]
    ], 0), [4, 0, 0, 0]))
    console.assert(equateLists(moveUp([
        [2,0,0,0],
        [2,0,0,0],
        [2,0,0,0],
        [2,0,0,0]
    ], 0), [4, 4, 0, 0]))
}


// a set of tests for moveUp
function moveDownTests() {
    console.assert(equateLists(moveDown([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [2,0,0,0]
    ], 0), [0, 0, 0, 2]))
    console.assert(equateLists(moveDown([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [1,0,0,0]
    ], 0), [0, 0, 0, 1]))
    console.assert(equateLists(moveDown([
        [0,0,0,0],
        [0,0,0,0],
        [2,0,0,0],
        [2,0,0,0]
    ], 0), [0, 0, 0, 4]))
    console.assert(equateLists(moveDown([
        [2,0,0,0],
        [2,0,0,0],
        [2,0,0,0],
        [2,0,0,0]
    ], 0), [0, 0, 4, 4]))
}
