"use strict"

const fs = require("fs")
const bp = require("babel-polyfill")

const shuffle = arr => {
    for (let i=arr.length; i; i--) {
        const j = Math.floor(Math.random() * i)
        const x = arr[i-1]
        arr[i-1] = arr[j]
        arr[j] = x
    }
}

const indeces = {
    training: {},
    test: {}
}

const getData = (type, count) => {
    return new Promise((resolve, reject) => {
        const outData = []
        const itemsPerCategory = Math.floor(parseInt(count)/10)

        CIFAR10.categories.forEach(category => {

            const sliceStart = Math.min(readIndexCounters[type][category]/10, CIFAR10[category][type].length) 
            let indecesToRead = indeces[type][category].slice(sliceStart, sliceStart+itemsPerCategory)

            if (indecesToRead.length < (itemsPerCategory-1)) {
                shuffle(indeces[type][category])
                indecesToRead = [...indecesToRead, ...indeces[type][category].slice(0, itemsPerCategory - indecesToRead.length)]
                readIndexCounters[type][category] = itemsPerCategory - indecesToRead.length
            }

            indecesToRead.sort()
            outData.push(get.bind(CIFAR10[category], indecesToRead)())
        })

        Promise.all(outData).then(resolved => {
            CIFAR10.categories.forEach(category => readIndexCounters[type][category] += itemsPerCategory*10)
            const final = resolved.reduce((prev, curr) => prev.concat(curr) ,[])
            shuffle(final)
            resolve(final)
        })
    })
}

// Maybe move the array logic into range(), with index conditions. Quicker than opening new streams for each index?
// But maybe only do it if the number of indeces is above, say ~5% of the total items, else just do it the current way
function get (index) {
    return new Promise(async (resolve, reject) => {
        if (Array.isArray(index)) {
            Promise.all(index.map(i => this.range(i))).then(data => resolve(data.map(items => items[0])))
        } else {
            const data = await this.range(index)
            resolve(data[0])
        }
    })
}

class CIFAR10 {

    static set (trainingSize=50000, testSize=10000) {

        trainingSize = Math.max(Math.floor(trainingSize/10)*10, 10)
        testSize = Math.max(Math.floor(testSize/10)*10, 10)

        if (trainingSize+testSize > this.dataCount) {
            console.warn(`Not enough data (${this.dataCount}) for ${trainingSize} training and ${testSize} test items. Scaling down.`)
            this.training.length = Math.floor((this.dataCount / (trainingSize+testSize)) * trainingSize/10)*10
            this.test.length = Math.floor((this.dataCount / (trainingSize+testSize)) * testSize/10)*10

        } else {
            this.training.length = trainingSize
            this.test.length = testSize
        }

        this.reset()

        if (trainingSize+testSize > this.dataCount) {
            return this.dataCount
        }
    }

    static reset () {
        this.categories.forEach(category => {

            // Generate list of indeces for entire data set, either afresh, or appended to existing
            indeces.training[category] = [...new Array(this[category].totalLength)].map((v,i) => i)
            shuffle(indeces.training[category])

            // Move some of those indeces into the test set
            indeces.test[category] = indeces.training[category].splice(this.training.length/10, this.dataCount/10)

            // Limit the indeces to the given .split() amount
            this[category].training.length = this.training.length/10
            this[category].test.length = this.test.length/10
        })
    }
}

class Category {

    constructor (label) {
        this.label = label
        this.output = [0,0,0,0,0,0,0,0,0,0]
        this.output[CIFAR10.categories.indexOf(label)] = 1
        this.totalLength = fs.statSync(`${CIFAR10.dataPath}/${this.label}.bin`).size / 3071
        this.length = this.totalLength

        this.training = {
            length: 0, 
            get: index => {
                index = index || index==0 ? index : Math.floor(Math.random()*this.training.length)
                return get.bind(this, Array.isArray(index) ? index.map(i => indeces.training[label][i]) : index)()
            }
        }
        this.test = {
            length: 0,
            get: index => {
                index = index || index==0 ? index : Math.floor(Math.random()*this.test.length)
                return get.bind(this, Array.isArray(index) ? index.map(i => indeces.test[label][i]) : index)()
            }
        }

        this.get = index => {
            index = index || index==0 ? index : Math.floor(Math.random()*(this.length-1))
            return get.bind(this, Array.isArray(index) ? index.map(i => indeces.test[label][i]) : index)()
        }
    }

    range (start=0, end) {
        return new Promise((resolve, reject) => {
            start = parseInt(start)
            const data = []
            const readStream = fs.createReadStream(`${CIFAR10.dataPath}/${this.label}.bin`, {
                start: start * 3071, 
                end: (parseInt(end) || (start+1)) * 3071,
                highWaterMark: 3072
            })
            readStream.on("data", chunk => data.push(chunk)) 
            readStream.on("end", () => {
                readStream.close()
                resolve(data.map(d => {
                    return {
                        input: Array.from(d).map(v => v/255),
                        output: this.output
                    }
                }))
            })
        })
    }
}

CIFAR10.categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"]
CIFAR10.training = {get: getData.bind(null, "training")}
CIFAR10.test = {get: getData.bind(null, "test")}
CIFAR10.dataCount = 60000

const readIndexCounters = {
    training: CIFAR10.categories.reduce((p,c) => {p[c] = 0; return p}, {}),
    test: CIFAR10.categories.reduce((p,c) => {p[c] = 0; return p}, {})
}

module.exports = ({dataPath=__dirname, testing=false}={}) => {

    CIFAR10.dataPath = dataPath
    CIFAR10.categories.forEach(category => CIFAR10[category] = new Category(category))
    CIFAR10.set(50000,10000)

    return testing ? {
        testing: {shuffle, get, getData, indeces},
        cifar10: CIFAR10
    } : CIFAR10
}