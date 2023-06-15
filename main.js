const nodeHtmlToImage = require('node-html-to-image')
const {getSizeTable} = require("./getSizeTable");

const data = {"S":{"총장":"46.4","허리(포켓 달리는 위치)":"36.5","엉덩이":"43.5"},"M":{"총장":"48.4","허리(포켓 달리는 위치)":"38.6","엉덩이":"45.5"}};
const data2 = {"XS/S":{"총기장":"81.5","어깨너비":"39","가슴너비":"39","허리":"33","힙너비":"43.5","소매기장":"44.5"},"S/M":{"총기장":"83","어깨너비":"41","가슴너비":"39","허리":"35","힙너비":"45.5","소매기장":"44.5"}};

const table = getSizeTable(data);

if (table === '') {
    return;
}
nodeHtmlToImage({
    output: './image.png',
    html: table,
})
    .then(() => console.log('The image was created successfully!'))
    .catch(() => console.log('The image was not created!'));
