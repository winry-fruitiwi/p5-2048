// the class that makes all the numbers look good. At first, I'll just
// display all the numbers in four rows and columns, then update every time
// I press a key. Then, I'll work on making a grid and number tiles with
// backgrounds. And finally, I'll work on making numbers arrive to their
// destination, including when they are about to merge. In that case,
// they'll disappear and turn into the new number.
class GameBoard {
    // variables: grid (2D array), gameWon (bool), gameLost (bool),
    // gameFinished (bool)
    constructor() {
        // before anything else, initialize the 4x4 grid. If in
        // 2048ForDummies mode in the future, make a 6x6 grid instead.
        this.initializeGrid()

        // these three booleans determine if a game has been won or lost,
        // and if one of them are true then the game has been finished.
        // However, 2048 can continue if the user wants to when they win, so
        // it's not necessarily true that gameFinished is true when gameWon
        // is true.
        this.gameWon = false
        this.gameLost = false
        this.gameFinished = false

        // the board's dimensions on the canvas
        this.width = 250
        this.height = 250
    }


    // initializes the grid. This will be important when I add Number.js so
    // that the constructor doesn't look messy and can be minimized.
    initializeGrid() {
        // create an empty grid
        this.grid = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        // spawn two random numbers inside the grid to construct a 2048 grid
        this.spawnRandomNumber()
        this.spawnRandomNumber()
    }


    // takes in a row of digits and moves them all to the right without
    // combining them at all
    slide(input2048Row) {
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

    // takes in a row of digits and combines all digits horizontally
    // adjacent to another digit of the same value
    combineAdjacent(input2048Row) {
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

    // moves all digits in a 2048 row to the right, accounting for combinations
    moveRight(input2048Row) {
        // the output
        let copied2048Row = [...input2048Row]

        // slide and combine the two rows
        let slid2048Row = slide(copied2048Row)
        let combined2048Row = this.combineAdjacent(slid2048Row)

        return this.slide(combined2048Row)
    }

    // moves all digits in a 2048 row to the left, accounting for combinations
    moveLeft(input2048Row) {
        // the output
        let copied2048Row = [...input2048Row]

        // slide and combine the two rows, but they have to be reversed
        // because I'm moving in the opposite direction
        copied2048Row.reverse()

        let output2048Row = this.moveRight(copied2048Row)

        output2048Row.reverse()
        return output2048Row
    }


    moveDown(input2048Grid, columnToMoveIndex) {
        let grid = [...input2048Grid]

        let column = this.getColumn2DGrid(grid, columnToMoveIndex)
        return this.moveRight([...column])
    }


    getColumn2DGrid(input2048Grid, inputColumnIndex) {
        let grid = [...input2048Grid]

        // a column created by this function
        let outputColumn = []

        for (let row of grid) {
            outputColumn.push(row[inputColumnIndex])
        }

        return outputColumn
    }


    moveUp(input2048Grid, columnToMoveIndex) {
        let grid = [...input2048Grid]

        let column = getColumn2DGrid(grid, columnToMoveIndex)
        return this.moveLeft([...column])
    }


    moveAllUp() {
        let gridToBeUpdated = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        for (let i = 0; i < this.grid.length; i++) {
            let column = this.moveUp(this.grid, i)
            // update all columns
            for (let j = 0; j < this.grid.length; j++) {
                gridToBeUpdated[j][i] = column[j]
            }
        }

        return gridToBeUpdated
    }


    moveAllDown() {
        let gridToBeUpdated = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        for (let i = 0; i < this.grid.length; i++) {
            let column = this.moveDown(this.grid, i)
            // update all columns
            for (let j = 0; j < this.grid.length; j++) {
                gridToBeUpdated[j][i] = column[j]
            }
        }

        return gridToBeUpdated
    }


    printGrid() {
        let gridToBePrinted = [...this.grid]
        console.clear()

        let printedGridString = ""

        for (let row of gridToBePrinted) {
            printedGridString += JSON.stringify(row) + "\n"
        }

        console.log(printedGridString)
    }


    spawnRandomNumber() {
        let randomRowIndex = int(random(this.grid.length))
        let randomColumnIndex = int(random(this.grid.length))

        // a limit on the number of times to reroll the random indices
        let numTimesToCheck = 100

        let numTimesCurrentlyChecked = 0
        while (this.grid[randomRowIndex][randomColumnIndex] !== 0 &&
        numTimesToCheck > numTimesCurrentlyChecked) {
            randomRowIndex = int(random(this.grid.length))
            randomColumnIndex = int(random(this.grid.length))

            numTimesCurrentlyChecked++

            if (numTimesToCheck === numTimesCurrentlyChecked) {
                return
            }
        }

        let randomTwoOrFour

        if (random() > 0.8) {
            randomTwoOrFour = 4
        } else {
            randomTwoOrFour = 2
        }

        this.grid[randomRowIndex][randomColumnIndex] = randomTwoOrFour
    }


    // display a 2D grid of numbers in rows and columns. Later, I'll also
    // give them backgrounds. The GameBoard itself is not displayed; rather,
    // the numbers inside are the ones being displayed. When I convert to
    // using Number classes later, them I can use the GameBoard's show()
    // function to show all the Numbers instead.
    show() {
        // the width and height of each cell.
        let w = this.width/4
        let h = this.height/4

        textAlign(CENTER)

        // assuming that the length of both rows and columns of the 2048
        // grid is 4!

        // push()
        // centers the grid in the canvas
        translate(width/2 - w * 2, height/2 - h * 2)

        noStroke()
        fill(31, 12, 80)
        rect(0, 0, this.width, this.height)
        fill(28, 13, 46)

        stroke(28, 14, 73)
        strokeWeight(10)
        // strokeCap(SQUARE)

        for (let i = 0; i <= this.grid.length; i++) {
            line(i*w, 0, i*w, this.height)
        }

        for (let i = 0; i <= this.grid.length; i++) {
            line(0, i*h, this.width, i*h)
        }

        for (let i = 0; i <= this.grid.length; i++) {
            for (let j = 0; j <= this.grid.length; j++) {
                stroke(28, 13, 46)
                strokeWeight(1)

                if (i < this.grid.length &&
                    j < this.grid.length &&
                    this.grid[i][j] !== 0) {
                    // noStroke()
                    textStyle(BOLD)
                    switch (str(this.grid[i][j]).length) {
                        case 1:
                            textFont(font, 24)
                            break;
                        case 2:
                            textFont(font, 20)
                            break;
                        case 3:
                            strokeWeight(1)
                            textFont(font, 18)
                            break;
                        case 4:
                            strokeWeight(0.5)
                            textFont(font, 16)
                            break;
                        case 5:
                            strokeWeight(0.5)
                            textFont(font, 15)
                            break;
                    }
                    text(this.grid[i][j], j*w+w/2, i*h+h/2 + textAscent()/2)
                    textFont(font, 24)
                }
            }
        }
        // pop()

        noStroke()

        textAlign(LEFT)
    }
}
