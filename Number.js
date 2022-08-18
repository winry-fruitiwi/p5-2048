class Number {
    constructor(value, columnIndex, rowIndex) {
        this.value = value
        this.columnIndex = columnIndex
        this.rowIndex = rowIndex
    }


    // moves the block across a 2048 grid. Currently, this "grid" is just a
    // row. Also takes in a list of blocks in the way.
    move(blocksInWay) {
        this.columnIndex = 3
    }


    // combines the current block with the one passed in as an argument
    combine(otherNumber) {

    }
}
