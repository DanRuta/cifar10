"use strict";

(() => {

    class CIFAR10 {

        static set (training, test) {
            fetch("/set", {method: "Post", body: JSON.stringify({training, test})})
            .then(r => r.json())
            .then(({dataCount}={}) => {
                if (dataCount) {
                    console.warn(`Not enough data (${dataCount}) for ${training} training and ${test} test items. Scaling down.`)
                }
            })
        }

        static reset () {
            fetch("/reset")
        }

        static render (data, context) {

            const inputData = data.input.map(v => v*255)
            const imageDataBuffer = new Uint8ClampedArray(32 * 32 * 4)

            for (let rowI=0; rowI<32; rowI++) {
                for (let colI=0; colI<32; colI++) {
                    const pos = (rowI * 32 + colI) * 4
                    imageDataBuffer[pos]   = inputData[rowI * 32 + colI]
                    imageDataBuffer[pos+1] = inputData[rowI * 32 + colI + 1024]
                    imageDataBuffer[pos+2] = inputData[rowI * 32 + colI + 2048]
                    imageDataBuffer[pos+3] = 255
                }
            }

            const imageData = context.createImageData(32, 32)
            imageData.data.set(imageDataBuffer)
            context.putImageData(imageData, 0, 0)
            context.stroke()
        }
    }

    CIFAR10.categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"]

    CIFAR10.categories.forEach(category => {
        CIFAR10[category] = {
            
            range: (start, end) => fetch("/range", {
                method: "Post",
                body: JSON.stringify({category, start, end})
            }).then(r => r.json()),

            training: {
                get: ({index, indexList}={}) => fetch("/category.training.get", {
                    method: "Post", 
                    body: JSON.stringify({category, index, indexList, type: "training"})
                }).then(r => r.json()),
                length: () => {
                    return new Promise((resolve, reject) => {
                        fetch("/category.training.length", {
                            method: "Post",
                            body: JSON.stringify({category})
                        }).then(r => r.json())
                        .then(({length}) => resolve(length))
                    })
                }
            },
            test: {
                get: ({index, indexList}={}) => fetch("/category.training.get", {
                    method: "Post", 
                    body: JSON.stringify({category, index, indexList, type: "test"})
                }).then(r => r.json()),
                length: () => {
                    return new Promise((resolve, reject) => {
                        fetch("/category.test.length", {
                            method: "Post",
                            body: JSON.stringify({category})
                        }).then(r => r.json())
                        .then(({length}) => resolve(length))
                    })
                }
            }
        }
    })

    CIFAR10.training = {
        get: count => {
            return fetch("/training.get", {method: "Post", body: JSON.stringify({count})})
                .then(r => r.json())
        },
        length: () => {
            return new Promise((resolve, reject) => {
                fetch("/training.length").then(r => r.json())
                .then(({length}) => resolve(length))
            })
        }
    }
    CIFAR10.test = {
        get: count => {
            return fetch("/test.get", {method: "Post", body: JSON.stringify({count})})
                .then(r => r.json())
        },
        length: () => {
            return new Promise((resolve, reject) => {
                fetch("/test.length").then(r => r.json())
                .then(({length}) => resolve(length))
            })
        }
    }

    window.CIFAR10 = CIFAR10
})()