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
        this.initializeGrid()

        this.gameWon = false
        this.gameLost = false
        this.gameFinished = false
    }


    // initializes the grid. This will be important when I add Number.js so
    // that the constructor doesn't look messy and can be minimized.
    initializeGrid() {
        this.grid = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        this.spawnRandomNumber()
        this.spawnRandomNumber()
    }


    // copy over most code for back-end functions here, just make sure that
    // they use this.grid and copy it correctly, then re-initialize it.
    // keyPressed must be revised to use this.grid.


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


    moveRight(input2048Row) {
        let copied2048Row = [...input2048Row]
        let slid2048Row = slide(copied2048Row)

        let combined2048Row = this.combineAdjacent(slid2048Row)

        return this.slide(combined2048Row)
    }


    moveLeft(input2048Row) {
        let copied2048Row = [...input2048Row]
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
        // where the text should be displayed
        // let textDisplayPos = new p5.Vector()

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid.length; j++) {
                text(this.grid[i][j], j * 20, i * 20 + textAscent())
            }
        }
    }
}
