"use strict"

const fs = require("fs")
const files = fs.readdirSync("./").filter(path => path.endsWith(".bin"))
const newFileNames = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"]

fs.mkdir("./data", () => {
    newFileNames.forEach(fileName => fs.writeFileSync(`./data/${fileName}.bin`, "binary"))
    const writeStreams = newFileNames.map(fileName => fs.createWriteStream(`./data/${fileName}.bin`, "binary"))

    const doFile = () => {

        if (!files.length) return void writeStreams.forEach(stream => stream.close())

        const readStream = fs.createReadStream(`./${files[0]}`, {highWaterMark: 3073})
        console.log(`\nDoing file: ${files[0]}`)

        let fileCounter = 0

        readStream.on("data", chunk => {
            fileCounter += 1
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(fileCounter/100+"%")
            writeStreams[chunk[0]].write(chunk.slice(1, 3072))
        })
        readStream.on("end", () => {
            files.shift()
            doFile()
        })
    }
    doFile()
})