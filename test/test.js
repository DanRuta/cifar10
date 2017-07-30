"use strict"

const chaiAsPromised = require("chai-as-promised")
const fs = require("fs")
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect
const sinonChai = require("sinon-chai")
const sinon = require("sinon")
chai.use(sinonChai)
chai.use(chaiAsPromised);

const {cifar10, testing} = require("../dist/cifar10.js")({dataPath: "./data", testing: true})
const {shuffle, get, getData, indeces} = testing
const categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"]

describe("Loading cifar10", () => {

    describe("Without testing flag", () => {
        sinon.stub(fs, "statSync").callsFake(() => {return {size: 307100}})
        const cifar10 = require("../dist/cifar10.js")()
        fs.statSync.restore()

        it("Loads just the CIFAR10 class", () => {
            expect(cifar10).to.not.be.undefined
            expect(cifar10.name).to.equal("CIFAR10")
        })

        it("Does not load any of the testing specific items", () => {
            expect(cifar10.shuffle).to.be.undefined
            // get is a separate thing that does get loaded
            expect(cifar10.getData).to.be.undefined
        })
    })

    describe("With testing flag", () => {

        it("Loads a CIFAR10 class when required", () => {
            expect(cifar10).to.not.be.undefined
            expect(cifar10.name).to.equal("CIFAR10")
        })

        it("Loads a testing object", () => {
            expect(testing).to.not.be.undefined
        })

        it("Loads a testing.shuffle function", () => {
            expect(shuffle).to.not.be.undefined
        })

        it("Loads a testing.get function", () => {
            expect(get).to.not.be.undefined
        })

        it("Loads a testing.getData function", () => {
            expect(getData).to.not.be.undefined
        })
        
        it("Loads a testing.indeces object", () => {
            expect(indeces).to.not.be.undefined
        })
    })
})


describe("CIFAR10 class", () => {

    describe("Defaults", () => {

        it("CIFAR10.categories includes all 10 categories", () => {
            expect(cifar10.categories).to.deep.equal(categories)
        })

        it("CIFAR10.dataCount is set to 60000", () => {
            expect(cifar10.dataCount).to.equal(60000)
        })

        it("CIFAR10.training.get is assigned the getData function", () => {
            expect(cifar10.training).to.not.be.undefined
            expect(typeof cifar10.training.get).to.equal("function")
            expect(cifar10.training.get.name).to.equal(getData.bind(null, "training").name)
        })

        it("CIFAR10.test.get is assigned the getData function", () => {
            expect(cifar10.test).to.not.be.undefined
            expect(typeof cifar10.test.get).to.equal("function")
            expect(cifar10.test.get.name).to.equal(getData.bind(null, "training").name)
        })

        it("Creates a Category class for each category and assigns it to CIFAR10", () => {
            categories.forEach(category => {
                expect(cifar10[category]).to.not.be.undefined
                expect(cifar10[category].constructor.name).to.equal("Category")
            })
        })

        it("Defaults the cifar10.training.length to 50000 and cifar10.test.length to 10000", () => {
            expect(cifar10.training.length).to.equal(50000)
            expect(cifar10.test.length).to.equal(10000)
        })

        it("Defaults the CIFAR10.dataPath to the __dirname of the file", () => {
            sinon.stub(fs, "statSync").callsFake(() => {return {size: 30710}})
            const cifar10 = require("../dist/cifar10.js")()
            fs.statSync.restore()
            expect(cifar10.dataPath).to.equal(__dirname.replace("test", "dist"))
        })
    })

    describe("set", () => {

        const reset = () => {
            cifar10.training.length = 0
            cifar10.test.length = 0
        }

        beforeEach(() => {
            sinon.stub(cifar10, "reset")
            reset()
        })

        afterEach(() => {
            cifar10.reset.restore()
            reset()
        })

        it("Sets the cifar10.training.length and cifar10.test.length to given values 80 and 20", () => {
            cifar10.set(80, 20)
            expect(cifar10.training.length).to.equal(80)
            expect(cifar10.test.length).to.equal(20)
        })

        it("Defaults the training and test parameters to 50000 and 10000 respectively when left blank", () => {
            cifar10.set()
            expect(cifar10.training.length).to.equal(50000)
            expect(cifar10.test.length).to.equal(10000)
        })

        it("Rounds down values to the nearest value divisible by 10", () => {
            cifar10.set(11, 29)
            expect(cifar10.training.length).to.equal(10)
            expect(cifar10.test.length).to.equal(20)
        })

        it("Thresholds values to at least 10, for both parameters", () => {
            cifar10.set(1, 9)
            expect(cifar10.training.length).to.equal(10)
            expect(cifar10.test.length).to.equal(10)
        })

        it("Warns the user when more data has been split than is available", () => {
            sinon.spy(console, "warn")
            cifar10.set(5000000, 1000000)
            expect(console.warn).to.have.been.called
            console.warn.restore()
        })

        it("Returns the total images count if more data has been split than is available", () => {
            const response = cifar10.set(5000000, 1000000)
            expect(response).to.equal(cifar10.dataCount)
        })

        it("Returns undefined if less data has been split than is available", () => {
            const response = cifar10.set(50, 10)
            expect(response).to.be.undefined
        })

        it("Scales down the training/test values if above data count", () => {
            cifar10.set(5000000, 1000000)
            expect(cifar10.training.length).to.equal(50000)
            expect(cifar10.test.length).to.equal(10000)
        })

        it("Rounds the values down to nearest values divisible by 10", () => {
            cifar10.set(34438907834, 4246982376)
            expect(cifar10.training.length%10).to.equal(0)
            expect(cifar10.test.length%10).to.equal(0)
        })
    })

    describe("reset", () => {

        before(() => {
            cifar10.training.length = 80
            cifar10.test.length = 20
            cifar10.dataCount = 20
            cifar10.reset()
        })

        it("For each category, it sets the indeces[category] to an array of the indeces of length category.totalLength", () => {
            categories.forEach(category => {
                expect(indeces.training[category]).to.not.be.undefined
                expect(indeces.training[category].length).to.be.at.least(1)
            })
        })

        it("Shuffles those values", () => {
            categories.forEach(category => {
                const temp = indeces.training[category].slice(0).sort((a,b) => a<b) 
                expect(indeces.training[category]).to.not.deep.equal(temp)
            })
        })

        it("Splits those arrays into their training and testing parts", () => {
            categories.forEach(category => {
                expect(indeces.test[category]).to.not.be.undefined
                expect(indeces.test[category].length).to.be.at.least(1)
            })
        })

        it("Sets the category training.length to a tenth of the cifar10.trainingSize", () => {
            categories.forEach(category => {
                expect(cifar10[category].training.length).to.equal(8)
            })
        })

        it("Sets the category test.length to a tenth of the cifar10.testSize", () => {
            categories.forEach(category => {
                expect(cifar10[category].test.length).to.equal(2)
            })
        })
    })
})

describe("Category class", () => {

    let cifar10, testing

    before(() => {
        const newCifar10 = require("../dist/cifar10.js")({dataPath: "./data", testing: true})
        cifar10 = newCifar10.cifar10
    })

    describe("Defaults", () => {

        it("Sets the label to the category", () => {
            categories.forEach(category => {
                expect(cifar10[category].label).to.equal(category)
            })
        })

        it("Sets the category.output to an array of 0s for each category except for its own index", () => {
            categories.forEach((category, ci) => {
                const output = [0,0,0,0,0,0,0,0,0,0]
                output[ci] = 1
                expect(cifar10[category].output).to.deep.equal(output)
            })
        })

        it("Sets the category.totalLength to the number of images there are in the file", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].totalLength).to.equal(6000)
            })
        })

        it("Sets the initial category.length to the category.totalLength", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].length).to.equal(cifar10[category].totalLength)
            })
        })

        it("Sets the category.training.get to the get function", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].training.get.name).to.equal("get")
            })
        })

        it("Sets the category.test.length to 0", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].test.length).to.equal(0)
            })
        })

        it("Sets the category.test.get to the get function", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].test.get.name).to.equal("get")
            })
        })

        it("Sets the category.get to the get function", () => {
            categories.forEach((category, ci) => {
                expect(cifar10[category].get).to.not.be.undefined
            })  
        })
    })

    describe("range", () => {

        it("Returns a promise", () => {
            categories.forEach(category => {
                expect(cifar10[category].range()).instanceof(Promise)
            })
        })

        it("Resolves an array of items", () => {
            return cifar10.cat.range().then(data => {
                expect(data).instanceof(Array)
            })
        })

        it("Resolves just one item when range is passed no parameters", () => {
            return cifar10.cat.range().then(data => {
                expect(data).to.have.lengthOf(1)
            })
        })

        it("Resolves in the arrays objects with keys 'input' and 'output'", () => {
            return cifar10.cat.range().then(data => {
                expect(data[0]).to.have.keys("input","output")
            })
        })

        describe("input", () => {

            it("Is an array containing 3072 values", () => {
                return cifar10.cat.range().then(data => {
                    const {input} = data[0]
                    expect(input).instanceof(Array)
                    expect(input).to.have.lengthOf(3072)
                })          
            })

            it("Returns values that are numbers", () => {
                return cifar10.cat.range().then(data => {
                    const {input} = data[0]
                    expect(input.every(v => typeof v == "number")).to.be.true
                })
            })

            it("Values are normalized", () => {
                return cifar10.cat.range().then(data => {
                    const {input} = data[0]
                    expect(input.every(v => v >= 0)).to.be.true
                    expect(input.every(v => v <= 1)).to.be.true
                })
            })
        })

        describe("output", () => {

            it("Returns an array containing 10 values", () => {
                return cifar10.cat.range().then(data => {
                    const {output} = data[0]
                    expect(output).instanceof(Array)
                    expect(output).to.have.lengthOf(10)
                })
            })

            it("Returns only numbers", () => {
                return cifar10.cat.range().then(data => {
                    const {output} = data[0]
                    expect(output.every(v => typeof v == "number")).to.be.true
                })
            })

            it("Returns values of all 0s except for one value, which is a 1", () => {
                return cifar10.cat.range().then(data => {
                    const {output} = data[0]
                    expect(output.filter(v => v==0)).to.have.lengthOf(9)
                    expect(output.filter(v => v==1)).to.have.lengthOf(1)
                })
            })
        })

        describe("get", () => {

            it("Returns one image when requesting from training with no parameters", () => {
                return cifar10.cat.training.get().then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns one image when requesting from test with no parameters", () => {
                return cifar10.cat.test.get().then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns one image when requesting from training with an index as parameter", () => {
                return cifar10.cat.training.get(1).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns one image when requesting from test with an index as parameter", () => {
                return cifar10.cat.test.get(1).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns an array of images when requesting from training with an array of indeces", () => {
                return cifar10.cat.training.get([1,2,3]).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.lengthOf(3)
                    expect(data[0]).to.have.keys("input","output")
                })
            })

            it("Returns an array of images when requesting from test with an array of indeces", () => {
                return cifar10.cat.test.get([1,2,3]).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.lengthOf(3)
                    expect(data[0]).to.have.keys("input","output")
                })
            })

            it("Returns one image when requesting from no specific split section", () => {
                return cifar10.cat.get().then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns one image when requesting from no specific split section with an index", () => {
                return cifar10.cat.get(0).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.keys("input","output")
                })
            })

            it("Returns an array of images when requesting from no specific split section withan array of indeces", () => {
                return cifar10.cat.get([1,2,3]).then(data => {
                    expect(data).to.not.be.undefined 
                    expect(data).to.have.lengthOf(3)
                    expect(data[0]).to.have.keys("input","output")
                })
            })
        })
    })
})

describe("shuffle", () => {

    const testArr = [1,2,3,4,5, "a", "b", "c"]
    const original = testArr.slice(0) 
    shuffle(testArr)

    it("Keeps the same number of elements", () => {
        expect(testArr).to.have.lengthOf(8)
    })

    it("Changes the order of the elements", () => {
        expect(testArr).to.not.deep.equal(original)
    })

    it("Does not include any new elements", () => {
        expect(testArr.every(elem => original.includes(elem))).to.be.true
    })

    it("Still includes all original elements", () => {
        expect(original.every(elem => testArr.includes(elem))).to.be.true
    })
})

describe("get", () => {

    const fakeThis = {range: x => [x, 2, 3]}

    beforeEach(() => {
        sinon.spy(fakeThis, "range")
    })

    afterEach(() => {
        fakeThis.range.restore()
    })

    it("Returns a promise", () => {
        expect(get.bind(fakeThis)()).instanceof(Promise)
    })

    it("Returns the first item in the array returned by the .range() function", () => {
        const out = get.bind(fakeThis, 1)()
        expect(fakeThis.range).to.have.been.called
        return expect(out).to.eventually.equal(1)
    })

    it("When index parameter is an array, it returns 1D array of first item from .range() function calls' response", () => {
        const out = get.bind(fakeThis, [1, 7, 10])()
        return expect(out).to.eventually.deep.equal([1,7,10])
    })
})

describe("getData", () => {

    it("Returns a promise", () => {
        expect(getData("training", 1)).instanceof(Promise)
    })

    it("Resolves an array", () => {
        return getData("training", 10).then(data => {
            expect(data).instanceof(Array)
        })
    })

    it("Resolves 100 items when requesting 100 items", () => {
        return getData("training", 100).then(data => {
            expect(data).to.have.lengthOf(100)
        })
    })

    it("Resolves 0 items when requesting less than 10 items (5)", () => {
        return getData("training", 5).then(data => {
            expect(data).to.have.lengthOf(0)
        })
    })

    it("Rounds down number of values to nearest 10. AKA, returns 50 items when requesting 57 items", () => {
        return getData("training", 55).then(data => {
            expect(data).to.have.lengthOf(50)
        })
    })

    it("Loops through the data again if requesting more than is available", () => {

        const oldIndecesData = indeces.training.cat
        indeces.training.cat = [1,2,3]

        return getData("training", 50).then(data => {
            indeces.training.cat = oldIndecesData
            expect(data.filter(({output}) => output.indexOf(1) == 3)).to.have.lengthOf(5)
        })
    })
})