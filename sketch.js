/**
 *  @author Winry
 *  @date 2022.8.10
 *
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// a row in the 2048 grid. later this will become a 2D grid. null represents
// empty spaces in the 2048 grid.
let rowIn2048Grid


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

    rowIn2048Grid = [2, 0, 0, 0]

    slideTests()
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

    // iterate through numbers in input
    for (let i = 0; i < input2048Row.length; i++) {
        let number = input2048Row[i]

        // when we encounter a nonzero number, for now we will shift it to
        // the end and not account for other blocks
        if (number > 0) {
            shifted2048Row[2] = number
        }
    }

    return shifted2048Row
}


// a set of test for slide()
function slideTests() {
    console.log(
        JSON.stringify(slide([2,0,0,0])) === JSON.stringify([0,0,0,2]))

    print(JSON.stringify( slide([2,0,0,0]) ) === JSON.stringify([0,0,0,2]))
    print(JSON.stringify( slide([0,2,0,0]) ) === JSON.stringify([0,0,0,2]))
    print(JSON.stringify( slide([0,0,2,0]) ) === JSON.stringify([0,0,0,2]))
    print(JSON.stringify( slide([0,0,0,2]) ) === JSON.stringify([0,0,0,2]))
    console.assert(JSON.stringify( slide([2,0,0,0]) ) === JSON.stringify([0,0,0,2]))
    console.assert(JSON.stringify( slide([0,2,0,0]) ) === JSON.stringify([0,0,0,2]))
    console.assert(JSON.stringify( slide([0,0,2,0]) ) === JSON.stringify([0,0,0,2]))
    console.assert(JSON.stringify( slide([0,0,0,2]) ) === JSON.stringify([0,0,0,2]))
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
        sketch stopped</pre>`)
    }
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
