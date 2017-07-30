# CIFAR-10

This is a helper library for loading the CIFAR-10 data set into either nodejs or the browser. It uses the entire data set (60000 items, across 10 classifications). Read more and **download the binary data set from [here](https://www.cs.toronto.edu/~kriz/cifar.html)**. Once downloaded, place all 6 ```.bin``` files next to the ```converter.js``` file and run the file, which will re-structure/re-categorise them into the data folder, for more efficient use with the library.

This library is inspired by [the MNIST library](https://github.com/cazala/mnist) by cazala, and the API is similar. People who have used the MNIST library should find this familiar. There are, however, a few key differences, due to the fact that there is far too much data (~175Mb) to load all at once.

I made this specifically for use with [the Network.js library](https://github.com/DanRuta/Network.js), but it should also work with whatever else follows a similar input format.

An example data structure for one image is:


```javascript
{
    input: [ ... 3072 normalized numbers ... ],
    output: [0,0,0,1,0,0,0,0,0,0]
}
```
Row by row, in the image, the first 1024 input numbers represent the red channel, the next 1024 represent the blue, and the last 1024 represent the green. You can use the following to render this to a canvas:
```javascript
const data = CIFAR10.cat.training.get() // Above example
CIFAR10.render(data, context)
```

## Usage

If using in Nodejs, you can just use the cifar10.js file, which will load the data from the data files. If using in the browser, you can either call the data from cifar10.js through your own nodejs server and front end code, or you can use the included cifar10-server.js and/or cifar10-client.min.js to serve the data to a browser, where you can use (almost) the same API as in nodejs to get the data. The only difference is when using ```.length```, as this is now an async function, ```.length()```, resolving data from the server. 

See below for examples, and more detail. A proper, real world demo will come when I finish adding Conv Layers to [the Network.js library](https://github.com/DanRuta/Network.js), but isolated examples can be seen in the index.html file in the dist folder.

#### Nodejs

##### Importing the library
```javascript
// When files are in the same folder as the library
const CIFAR10 = require("./cifar10")()

// If you need to prefix the file locations with custom destination
const CIFAR10 = require("./cifar10")({dataPath: "../data"})
```

##### Splitting the training and test data
By default, the data is split into 50000 for training and 10000 for test, but you can change this to something else, like so:
```javascript
CIFAR10.set(8000, 2000)
```

##### Getting random data
The data is normalized and shuffled. The number of images returned is rounded down to the nearest number divisible by 10, in order to get equal amounts of data from each classification. The categories (and the images within the categories) are all shuffled.
```javascript
// Get 1000 random training images (100 from each class)
CIFAR10.training.get(1000)

// When testing
CIFAR10.test.get(1000)
```
##### Getting 1 random image from a particular category
```javascript
const {input, output} = await CIFAR10.cat.training.get()
```
##### Getting image at an index
```javascript
// Get the first image in the training split
const {input, output} = await CIFAR10.cat.training.get(0)
```
##### Getting list of images by index
```javascript
// Get the first 3 images in the test split
const imageList = await CIFAR10.cat.test.get([0,1,2])
```
##### Getting a range of images
```javascript
const imageList = await CIFAR10.cat.range(0,100)
```
Note, this gets images directly from the file, unaffected by the splitting/shuffling.
##### Re-split and re-shuffle the training/testing indeces
```javascript
CIFAR10.reset()
```
#### Browser
To see a working demo file with examples for every function, you can look at the ```index.html``` file in the dist folder. Run ```node cifar10-server.js``` and go to ```localhost:1337``` in the browser.

As mentioned above, the only difference between the nodejs and client side APIs is that using ```.length``` is done through an async function in the browser. So for example, this is how you would use it in node and in the browser:
```javascript
// Nodejs
console.log(CIFAR10.cat.training.length)

// Browser
const length = await CIFAR10.cat.training.length()
console.log(length)
```
##### Rendering
You can render to a canvas on the page using the .render() function which takes as input the same data structure as returned by the library. EG:
```javascript
const canvas = document.createElement("canvas")
const context = canvas.getContext("2d")
document.body.appendChild(canvas)

const dogImage = await CIFAR10.dog.training.get()
CIFAR10.render(dogImage, context)
```
You may want to use CSS to stretch out the canvas, if you want to actually see the images, as they are quite small.

## Credit

The idea for this project came from cazala's MNIST library which I've used in the past. I decided to keep the API design similar due to the ease of use, familiarity and consistency.


## Contributing

Pull requests are always welcome. You can run ```npm test``` to make sure the tests pass and coverage stays good.