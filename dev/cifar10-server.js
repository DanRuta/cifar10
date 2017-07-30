"use strict"

const http = require("http")
const url = require("url")
const fs = require("fs")
const cifar10 = require("./cifar10")({dataPath: "../data"})

http.createServer((request, response) => {

    let path = url.parse(request.url).pathname
    let jsonData = ""
    let data = ""
    path = path=="/" ? "index.html" : path

    request.on("data", chunk => jsonData += chunk)
    request.on("end", async () => {

        console.log(path)

        jsonData = jsonData.length ? JSON.parse(jsonData) : jsonData

        switch(path) {

            case "/set":
                const dataCount = cifar10.set(jsonData.training, jsonData.test)
                data = JSON.stringify({dataCount})
                break

            case "/range": 
                try {
                    data = await cifar10[jsonData.category].range(jsonData.start, jsonData.end)  
                    data = JSON.stringify(data)
                } catch (e) {console.log(e.stack)}
                break

            case "/reset": 
                cifar10.reset()
                break

            case "/training.get":
                try {
                    if (jsonData.indexList) {
                        data = await cifar10.training.get(jsonData.indexList)
                    } else {
                        data = await cifar10.training.get(jsonData.count)
                    }
                    data = JSON.stringify(data)
                } catch (e) {console.log(e.stack)}
                break

            case "/test.get":
                try {
                    if (jsonData.indexList) {
                        data = await cifar10.test.get(jsonData.indexList)
                    } else {
                        data = await cifar10.test.get(jsonData.count)
                    }
                    data = JSON.stringify(data)
                } catch (e) {console.log(e.stack)}
                break

            case "/training.length":
                data = JSON.stringify({length: cifar10.training.length})
                break

            case "/test.length":
                data = JSON.stringify({length: cifar10.test.length})
                break

            case "/category.training.get":
                try {
                    if (jsonData.indexList) {
                        data = await cifar10[jsonData.category].training.get(jsonData.indexList)
                    } else {
                        data = await cifar10[jsonData.category].training.get(jsonData.count)
                    }
                    data = JSON.stringify(data)

                } catch (e) {console.log(e.stack)}
                break

            case "/category.test.get":
                try {
                    if (jsonData.indexList) {
                        data = await cifar10[jsonData.category].test.get(jsonData.indexList)
                    } else {
                        data = await cifar10[jsonData.category].test.get(jsonData.count)
                    }
                    data = JSON.stringify(data)

                } catch (e) {console.log(e.stack)}
                break

            case "/category.training.length":
                data = JSON.stringify({length: cifar10[jsonData.category].training.length})
                break

            case "/category.test.length":
                data = JSON.stringify({length: cifar10[jsonData.category].test.length})
                break

            default:
                try {
                    data = fs.readFileSync(__dirname+"/"+path)
                } catch(e) {}

        }

        response.end(data)
    })

}).listen(1337, () => console.log("Listening on port 1337"))