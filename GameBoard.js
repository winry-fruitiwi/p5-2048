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
        // the board's dimensions on the canvas
        this.width = 500
        this.height = 500


        // before anything else, initialize the 4x4 grid. If in
        // 2048ForDummies mode in the future, make a 6x6 grid instead.
        this.initializeGrid()
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
            let potentialGridNum = input2048Row[i]

            // when we encounter a nonzero number, for now we will shift it to
            // the end and not account for other blocks
            if (potentialGridNum !== 0) {
                shifted2048Row[nextNumberPos] = potentialGridNum.value
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

    // moves all digits in a 2048 row to the right, accounting for combinations
    moveDown(input2048Grid, columnToMoveIndex) {
        // copy the grid
        let grid = [...input2048Grid]

        // get a column from the grid and shift all of its digits down
        let column = this.getColumn2DGrid(grid, columnToMoveIndex)
        return this.moveRight([...column])
    }

    // returns a column in a 2D 2048 grid
    getColumn2DGrid(input2048Grid, inputColumnIndex) {
        let grid = [...input2048Grid]

        // a column created by this function
        let outputColumn = []

        // initializes the column with the values in the grid
        for (let row of grid) {
            outputColumn.push(row[inputColumnIndex])
        }

        return outputColumn
    }


    // moves all digits in a 2048 row to the left, accounting for combinations
    moveUp(input2048Grid, columnToMoveIndex) {
        // copy the grid
        let grid = [...input2048Grid]

        // get a column and shift all of its digits up
        let column = getColumn2DGrid(grid, columnToMoveIndex)
        return this.moveLeft([...column])
    }

    // moves all columns up
    moveAllUp() {
        let gridToBeUpdated = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        // for every row, move all the columns up, then update the copied grid
        for (let i = 0; i < this.grid.length; i++) {
            let column = this.moveUp(this.grid, i)
            // update all columns
            for (let j = 0; j < this.grid.length; j++) {
                gridToBeUpdated[j][i] = column[j]
            }
        }

        return gridToBeUpdated
    }


    // moves all columns down
    moveAllDown() {
        let gridToBeUpdated = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        // for every row, move all the columns down, then update the copied grid
        for (let i = 0; i < this.grid.length; i++) {
            let column = this.moveDown(this.grid, i)
            // update all columns
            for (let j = 0; j < this.grid.length; j++) {
                gridToBeUpdated[j][i] = column[j]
            }
        }

        return gridToBeUpdated
    }


    // prints the grid out in the console. for back-end testing only.
    printGrid() {
        // copy the grid and then clear the console
        let gridToBePrinted = [...this.grid]
        // console.clear()

        // initialize a string for the printed grid
        let printedGridString = ""

        // stringify each row of the grid and then print it
        for (let row of gridToBePrinted) {
            printedGridString += JSON.stringify(row) + "\n"
        }

        console.log(printedGridString)
    }

    // spawn a random number
    spawnRandomNumber() {
        // randomize the spawning of the row or column
        let randomRowIndex = int(random(this.grid.length))
        let randomColumnIndex = int(random(this.grid.length))

        // a limit on the number of times to reroll the random indices
        let numTimesToCheck = 100

        // if needed, reroll the random indices up to numTimesToCheck in
        // order to find a good spot for the new number
        let numTimesCurrentlyChecked = 0
        while (this.grid[randomRowIndex][randomColumnIndex] !== 0 &&
        numTimesToCheck > numTimesCurrentlyChecked) {
            // reroll the indices if not found.
            // TODO report any instances of numbers not spawning!
            randomRowIndex = int(random(this.grid.length))
            randomColumnIndex = int(random(this.grid.length))

            numTimesCurrentlyChecked++

            if (numTimesToCheck === numTimesCurrentlyChecked) {
                return
            }
        }

        // you can spawn either a random two or four, but you rarely get a four
        let randomTwoOrFour

        if (random() > 0.8) {
            randomTwoOrFour = 4
        } else {
            randomTwoOrFour = 2
        }

        console.log(this.width)
        console.log(this.height)

        // create a grid number with its random properties
        // input the random number into the random row index
        this.grid[randomRowIndex][randomColumnIndex] = new GridNum(
            randomTwoOrFour,
            new p5.Vector(
                randomRowIndex * this.width / 4,
                randomColumnIndex * this.height / 4
            ),
            this.width / 4,
            this.height / 4
        )
    }


    // display a 2D grid of numbers in rows and columns. Later, I'll also
    // give them backgrounds. The GameBoard itself is not displayed; rather,
    // the numbers inside are the ones being displayed. When I convert to
    // using Number classes later, then I can use the GameBoard's show()
    // function to show all the Numbers instead.
    show() {
        // the width and height of each cell.
        let w = this.width/4
        let h = this.height/4

        // the width of each line of the grid.x
        let gridLineWidth = 20

        textAlign(CENTER)
        rectMode(CORNER)

        // assuming that the length of both rows and columns of the 2048
        // grid is 4!

        // push()
        // centers the grid in the canvas
        translate(width/2 - w * 2, height/2 - h * 2)

        // create the background for the grid
        noStroke()
        fill(31, 12, 80)
        rect(0, 0, this.width, this.height)
        fill(28, 13, 46)

        stroke(28, 14, 73)
        strokeWeight(gridLineWidth)
        // strokeCap(SQUARE)

        // add the lines of the grid
        for (let i = 0; i <= this.grid.length; i++) {
            line(i*w, 0, i*w, this.height)
        }

        for (let i = 0; i <= this.grid.length; i++) {
            line(0, i*h, this.width, i*h)
        }

        // a list of background colors for each number
        let numberBackgroundColors = {
            2: color(30, 8, 93),
            4: color(38, 15, 92),
            8: color(27, 50, 94),
            16: color(20, 50, 96),
            32: color(11, 61, 96),
            64: color(11, 76, 96),
            128: color(45, 51, 92),
            256: color(45, 58, 92),
            512: color(45, 66, 92),
            1024: color(46, 73, 92),
            2048: color(46, 80, 92),
        }

        // for every number in the grid:
        for (let i = 0; i <= this.grid.length; i++) {
            for (let j = 0; j <= this.grid.length; j++) {
                // if the current number is greater than 0:
                if (i < this.grid.length &&
                    j < this.grid.length &&
                    this.grid[i][j] !== 0) {
                    rectMode(CENTER)
                    // add a colored rectangle behind every number
                    // displayed. Its color is determined by the number. If
                    // it's greater than 2048, then it should have a
                    // blackish color. Otherwise, it should be in the
                    // dictionary of numbers.
                    if (this.grid[i][j] > 2048) {
                        fill(48, 16, 23)
                    } else {
                        fill(numberBackgroundColors[this.grid[i][j]])
                    }

                    noStroke()

                    // a constant that determines the margin between each
                    // square.
                    const squareMargin = 14
                    // determines the roundness of the square's edges.
                    const rounding = 3

                    rect(j*w+w/2, i*h+h/2, w-squareMargin, h-squareMargin, rounding)

                    stroke(28, 13, 46)
                    fill(28, 13, 46)
                    strokeWeight(1)

                    // if the grid number is greater than 4, then the fill
                    // and stroke should be set to white.
                    if (this.grid[i][j] > 4) {
                        fill(34, 2, 97)
                        stroke(34, 2, 97)
                    }
                }

                // depending on the length of the current number in the
                // grid, change the font size for the display
                if (i < this.grid.length &&
                    j < this.grid.length &&
                    this.grid[i][j] !== 0) {
                    // noStroke()
                    textStyle(BOLD)
                    switch (str(this.grid[i][j]).length) {
                        case 1:
                            strokeWeight(2)
                            textFont(font, 48)
                            break;
                        case 2:
                            strokeWeight(2)
                            textFont(font, 40)
                            break;
                        case 3:
                            strokeWeight(2)
                            textFont(font, 36)
                            break;
                        case 4:
                            strokeWeight(1)
                            textFont(font, 32)
                            break;
                        case 5:
                            strokeWeight(1)
                            textFont(font, 30)
                            break;
                    }

                    // display the number with the current font size
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
