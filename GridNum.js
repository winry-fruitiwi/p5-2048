// a number class representing a number with a value that can move
class GridNum {
    constructor(value, pos, w, h) {
        this.value = value
        this.pos = pos
        this.ifJustCreated = true // needs to be constantly updated every move

        // the fields that control the width and height of this Number
        this.w = w
        this.h = h
    }

    // sometimes you need to set the position of the number outside the
    // method. if this is the case, then the number was moved, and we have
    // to make ifJustCreated false
    setPos(pos) {
        this.pos = pos
        this.ifJustCreated = false
    }

    // arrives at an end position. this is to be done later after reviewing
    // another project.
    arrive(endPos) {

    }

    // represents the class as a number. same as __repr__ dunder method in
    // python
    toString() {
        return str(this.value)
    }

    // draws the number. Used in GameBoard.show.
    // NOTE: this is assuming that there are no numbers whose value is 0 or
    // below. That is handled in GameBoard.js.
    show() {
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

        // if the number's value is below 4096, set the background color to
        // the color corresponding to the number. otherwise, set it to
        // color(48, 16, 23), the default color for numbers above 4096.
        noStroke()
        if (this.value < 4096) {
            fill(numberBackgroundColors[this.value])
        } else {
            fill(48, 16, 23)
        }

        // translate to the position of the number, centered in the middle
        // of the number cell.
        push()
        translate(this.pos.x, this.pos.y)

        // draw a rounded rectangle with no stroke and the current fill
        // centered in the middle. rounding determines the radius of the
        // rounding at the corners of the rectangle.
        let rounding = 4

        rectMode(CENTER)
        rect(0, 0, this.w, this.h, rounding)

        // if the number's value is below 8, the background isn't dark
        // enough for the number to be legible when white, so instead make
        // it mostly black. Otherwise, make it mostly white.
        if (this.value > 4) {
            fill(34, 2, 97)
            stroke(34, 2, 97)
        }

        else {
            stroke(28, 13, 46)
            fill(28, 13, 46)
        }

        // depending on the number's length, change its font size so that it
        // fits in the cell. A 16384 will not fit in a cell with a 2's font
        // size, most likely!
        switch (str(this.value).length) {
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

        textAlign(CENTER)
        text(str(this.value), 0, textAscent()/2)

        pop()
    }
}
