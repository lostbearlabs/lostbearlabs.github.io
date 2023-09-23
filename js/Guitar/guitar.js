// TODO: add shadow notes
// TODO (?): color equivalent notes

let minX = 100
let minY = 40
let dString = 35
let dFret = 40

let numStrings = 6
let numFrets = 15
let strings = []
let frets = []
let bars = []
let notes = []
let labels = []

let maxY = minY + (numStrings) * dString
let maxX = minX + (numFrets+1) * dFret

let neckWidth = minX*2 + dFret*numFrets
let neckHeight = minY*2 + dString*(numStrings-1)

let silent = -100
let fretted = [silent, silent, silent, silent, silent, silent]

window.onload = function () {
    setupNeck()
    setupDots()
    setupStrings()
    setupFrets()
    setupNotes()
    setupLabels()
    addClickListener()
}

function px(n) {
    return String(n) + "px"
}

function setupNeck() {
    let neck = document.getElementById("neck")
    neck.style.width = px(neckWidth)
    neck.style.height = px(neckHeight)

    let rest = document.getElementById("rest")
    rest.style.top = px(neckHeight+50)
    rest.style.left = px(minX + dFret + dFret/2)
}

function notePosX(fret) {
    if (fret < 0 || fret > numFrets) {
        return px(minX + 5)
    } else {
        let x = (minX + (fret + 0.35 ) * dFret)
        return px(x)
    }
}

function setupLabels() {
    let neck = document.getElementById("neck")
    for( let i=0; i<numStrings; i++) {
        let label = document.createElement("div")
        label.id = `label${i}`
        label.className = "label"
        label.style.top = px((i+1)*dString - 5)
        neck.appendChild(label)
        labels.push(label)
    }
}

function setupStrings() {
    let neck = document.getElementById("neck")
    for( let i=0; i<numStrings; i++) {
        let string = document.createElement("div")
        string.id = `string${i}`
        string.className = "string"
        string.style.top = px((i+1)*dString)
        string.style.left = notePosX(0)
        string.style.width = px(numFrets * dFret)
        neck.appendChild(string)
        strings.push(string)
    }
}

function setupNotes() {
    let neck = document.getElementById("neck")
    for( let i=0; i<numStrings; i++) {
        let note = document.createElement("div")
        note.id = `note${i}`
        note.className = "silent"
        note.style.top = px((i+1)*dString - 5)
        note.style.left = notePosX(0)
        neck.appendChild(note)
        notes.push(note)
    }
}


function setupFrets() {
    let neck = document.getElementById("neck")
    for( let i=0; i<numFrets; i++) {
        let fret = document.createElement("div")
        fret.id = `fret${i}`
        fret.className = i===0 ? "nut" : "fret"
        let dx = i===0 ? -3 : 0
        fret.style.left = px( minX + (i+1)*dFret + dx)
        fret.style.height = px(numStrings*dString)
        neck.appendChild(fret)
        frets.push(fret)
    }
}

function setupDots() {
    setupDot(5, 3)
    setupDot(7, 3)
    setupDot(12, 2)
    setupDot(12, 4)
}

function setupDot(fret, string) {
    let neck = document.getElementById("neck")
    let dot = document.createElement("div")
    dot.className = "dot"
    dot.style.left = px( minX + (fret+.30)*dFret)
    dot.style.top = px( minY + (string-.75)*dString)
    neck.appendChild(dot)
    bars.push(dot)
}


function addClickListener() {
    document.getElementById("neck").addEventListener("click", (event) => {
        let x = event.x
        let y = event.y
        console.log(`click x=${x}, y=${y}, minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`)
        if (x < minX || x > maxX || y < minY || y > maxY) {
            return
        }

        let fret = Math.floor((x - minX - dFret) / dFret)
        let string = Math.floor((y - minY) / dString)
        console.log(`fret=${fret}, string=${string}`)

        let oldFret = fretted[string]
        let newFret = (oldFret === fret) ? silent : fret
        fretted[string] = newFret

        render()
    });
}

function render() {
    for (let i = 0; i < numStrings; i++) {
        let note = notes[i]
        let fret = fretted[i]
        if (fret < 0 || fret >= numFrets) {
            note.style.left = notePosX(silent)
            note.className = "silent"
            labels[i].innerText = ""
        } else {
            note.style.left = notePosX(fretted[i])
            note.className = "note"
            labels[i].innerText = noteName(i, fretted[i])
        }
    }
}

function noteName(string, fret) {
    let bases = [0, 5, 10, 15, 19, 24]
    let names = ["E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb"]
    let numTones = names.length
    let tone = (bases[6-string-1] + fret + numTones) % numTones
    // console.log(`string=${string}, fret=${fret}, tone=${tone}`)
    return names[tone]
}


function onClear() {
    for (let i = 0; i < 6; i++) {
        fretted[i] = silent
    }
    render()
}

function onMove(dx, dy) {
    // console.log(`dx=${dx}, dy=${dy}`)
    if (dx !== 0) {
        for (let i = 0; i < 6; i++) {
            fretted[i] += dx
        }
    }

    for( let i=0; i<dy; i++) {
        // console.log("moving up")
        let prev = fretted.slice()
        fretted[0] = prev[1]
        fretted[1] = prev[2] + 1
        fretted[2] = prev[3]
        fretted[3] = prev[4]
        fretted[4] = prev[5]
        fretted[5] = prev[0]
    }
    for( let i=0; i>dy; i--) {
        // console.log("moving down")
        let prev = fretted.slice()
        fretted[0] = prev[5]
        fretted[1] = prev[0]
        fretted[2] = prev[1] - 1
        fretted[3] = prev[2]
        fretted[4] = prev[3]
        fretted[5] = prev[4]
    }

    render()
}

function setChord(name) {
    onClear()
    if( name==="C") {
        fretted[1] = 1
        fretted[3] = 2
        fretted[4] = 3

        fretted[0] = 0
        fretted[2] = 0
        fretted[5] = 0
    }
    if( name==="A") {
        fretted[1] = 2
        fretted[2] = 2
        fretted[3] = 2

        fretted[0] = 0
        fretted[4] = 0
        fretted[5] = 0
    }
    if( name==="G") {
        fretted[0] = 3
        fretted[4] = 2
        fretted[5] = 3

        fretted[2] = 0
        fretted[3] = 0
        fretted[1] = 0
    }
    if( name==="E") {
        fretted[2] = 1
        fretted[3] = 2
        fretted[4] = 2

        fretted[0] = 0
        fretted[1] = 0
        fretted[5] = 0
    }
    if( name==="D") {
        fretted[0] = 1
        fretted[1] = 2
        fretted[2] = 1

        fretted[3] = 0
        fretted[4] = 0
    }


    render()
}