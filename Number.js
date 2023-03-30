// a number class representing a number with a value that can move
class Number {
    constructor(value, pos) {
        this.value = value
        this.pos = pos
        this.ifJustCreated = true // needs to be constantly updated every move
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
}
