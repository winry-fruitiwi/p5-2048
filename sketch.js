/**
 *  @author Winry
 *  @date 2022.8.10
 *
 *  Status: It has been almost a year since I started the project.
 *  I'm working on polishing off the visuals and adding a score display and
 *  new game button.
 *
 */


let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// the 2048 grid represented by a 2D array. Can later be manipulated by tests.
// let grid

// has the user won or lost?
let gameFinished = false

// the value required for the user to win
const WINNING_VALUE = 2048

// the GameBoard that represents this game!
let gameBoard

// a test instance of a Number class that regenerates itself every couple of
// frames. Note: this is not the primitive Int class, but the Number class I
// implemented myself.
let testNum

// a drawing context for adding a blurred shadow
let dc


function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
}

function setup() {
    let cnv = createCanvas(520, 520)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 34)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
    numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    gameBoard = new GameBoard()

    dc = drawingContext

    gameBoard.show()

    let widthAndHeight = 125

    testNum = new GridNum(random([2, 4, 8, 16, 32]),
                          new p5.Vector(random(100, width-100), random(100, height-100)),
                          widthAndHeight, widthAndHeight
    )

    userWonOrLost()

    let scoreDisplay = document.getElementById("scoreWidget")
    scoreDisplay.innerHTML = "score: 0"
}


function draw() {
    background(234, 34, 24)

    if (frameCount > 3000)
        noLoop()

    // if (frameCount % 50 === 0) {
    //     let widthAndHeight = 125
    //
    //     testNum = new GridNum(random([2, 4, 8, 16, 32]),
    //         new p5.Vector(random(100, width-100), random(100, height-100)),
    //         widthAndHeight, widthAndHeight
    //     )
    // }

    gameBoard.show()

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()

    textFont(font, 24)

    // testNum.show()
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
        if (list1[i].value !== list2[i].value) {
            return false
        }
    }
    return true
}


// a for loop that returns whether two nested lists are equal using equateLists.
function equateNestedLists(inputNestedList1, inputNestedList2) {
    let list1 = [...inputNestedList1]
    let list2 = [...inputNestedList2]

    if (list1.length !== list2.length) {
        return false
    }

    for (let i = 0; i < list1.length; i++) {
        if (!equateLists(list1[i], list2[i])) {
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
function spawnRandomNumber() {
    let randomRowIndex = int(random(grid.length))
    let randomColumnIndex = int(random(grid.length))

    // a limit on the number of times to reroll the random indices
    let numTimesToCheck = 100

    let numTimesCurrentlyChecked = 0
    while (grid[randomRowIndex][randomColumnIndex] !== 0 &&
    numTimesToCheck > numTimesCurrentlyChecked) {
        randomRowIndex = int(random(grid.length))
        randomColumnIndex = int(random(grid.length))

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

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
    }

    // if the game is still going on, update the grid in the appropriate
    // direction every time a key is pressed
    if (!gameBoard.gameFinished) {
        if (keyCode === LEFT_ARROW || key === "a") {
            let previousGrid = [...gameBoard.grid]

            for (let i = 0; i < gameBoard.grid.length; i++) {
                gameBoard.grid[i] = gameBoard.moveLeft(gameBoard.grid[i])
            }

            if (equateNestedLists(gameBoard.grid, previousGrid)) {
                return
            }

            gameBoard.spawnRandomNumber()

            gameBoard.setNumPos()
        }

        if (keyCode === RIGHT_ARROW || key === "d") {
            let previousGrid = [...gameBoard.grid]

            for (let i = 0; i < gameBoard.grid.length; i++) {
                gameBoard.grid[i] = gameBoard.moveRight(gameBoard.grid[i])
            }

            if (equateNestedLists(gameBoard.grid, previousGrid)) {
                return
            }

            gameBoard.spawnRandomNumber()

            gameBoard.setNumPos()
        }

        if (keyCode === DOWN_ARROW || key === "s") {
            let gridToBeUpdated = gameBoard.moveAllDown()

            if (equateNestedLists(gameBoard.grid, gridToBeUpdated)) {
                return
            }

            gameBoard.grid = [...gridToBeUpdated]

            gameBoard.setNumPos()


            gameBoard.spawnRandomNumber()}

        if (keyCode === UP_ARROW || key === "w") {
            let gridToBeUpdated = gameBoard.moveAllUp()

            if (equateNestedLists(gameBoard.grid, gridToBeUpdated)) {
                return
            }

            gameBoard.grid = [...gridToBeUpdated]

            gameBoard.setNumPos()


            gameBoard.spawnRandomNumber()}

        userWonOrLost()
    }
}


// prints the 2048 grid

/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = false
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

    showBottom() {
        rectMode(CORNERS)
        if (this.visible) {
            textFont(fixedWidthFont, 14)

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

    showTop() {
        if (this.visible) {
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
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


// moves all numbers in the 2048 grid up.
function moveAllUp() {
    let gridToBeUpdated = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]

    for (let i = 0; i < gameBoard.grid.length; i++) {
        let column = gameBoard.moveUp(gameBoard.grid, i)
        // update all columns
        for (let j = 0; j < gameBoard.grid.length; j++) {
            gridToBeUpdated[j][i] = column[j]
        }
    }

    return gridToBeUpdated
}


// moves all numbers in the 2048 grid down.
function moveAllDown() {
    let gridToBeUpdated = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]

    for (let i = 0; i < gameBoard.grid.length; i++) {
        let column = gameBoard.moveDown(gameBoard.grid, i)
        // update all columns
        for (let j = 0; j < gameBoard.grid.length; j++) {
            gridToBeUpdated[j][i] = column[j]
        }
    }

    return gridToBeUpdated
}


// has the user won or lost?
function userWonOrLost()  {
    // has the user won?
    for (let row of gameBoard.grid) {
        for (let square of row) {
            if (square === WINNING_VALUE) {
                noLoop()
                console.log("You won!")
                gameFinished = true
            }
        }
    }

    // the beginning of checks for if the user has lost
    // check 1: are all cells filled?
    for (let row of gameBoard.grid) {
        for (let cell of row) {
            if (cell === 0) {
                return
            }
        }
    }

    // check 2: does moveRight do anything?
    let gridCopy = [...gameBoard.grid]

    for (let i = 0; i < gridCopy.length; i++) {
        gridCopy[i] = gameBoard.moveRight(gridCopy[i])
    }

    if (!equateNestedLists(gridCopy, gameBoard.grid)) {
        return
    }


    // check 3: does moveLeft do anything?
    gridCopy = [...gameBoard.grid]

    for (let i = 0; i < gridCopy.length; i++) {
        gridCopy[i] = gameBoard.moveLeft(gridCopy[i])
    }

    if (!equateNestedLists(gridCopy, gameBoard.grid)) {
        return
    }


    // check 4: does moveUp do anything?
    let updatedGrid = gameBoard.moveAllUp()

    if (!equateNestedLists(gameBoard.grid, updatedGrid)) {
        return
    }


    // check 5: does moveDown do anything?
    updatedGrid = gameBoard.moveAllDown()

    if (!equateNestedLists(gameBoard.grid, updatedGrid)) {
        return
    }


    // if all the checks pass, then the user loses!
    print("game over! (make sure to analyze)")
    gameBoard.gameFinished = true
}


function resetDcShadow() {
    dc.shadowBlur = 0
    dc.shadowOffsetY = 0
    dc.shadowOffsetX = 0
}

function addDcShadow() {
    dc.shadowBlur = 20
    dc.shadowColor = color(46, 50, 100)
}

function addIntenseShadow() {
    dc.shadowBlur = 44
    dc.shadowColor = color(46, 85, 100)
}
