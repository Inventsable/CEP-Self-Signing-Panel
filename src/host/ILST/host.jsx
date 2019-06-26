console.log("Testing various ES6 methods:");
var simpleTest = ["a", "b", "c", "d"];
var advTest = [
    {
        val: "Hello",
        key: 0
    },
    {
        val: "World",
        key: 1
    },
    {
        val: "Universe",
        key: 2
    }
];
console.log("Filter results:");
var filterTest = simpleTest.filter(function (item) {
    return /a|d/.test(item);
});
console.log(filterTest);
console.log("find results:");
var findTest = advTest.find(function (item) {
    return item.key == 1;
});
console.log(findTest.key + " ? " + findTest.val);
console.log("Map results:");
var mapTest = simpleTest.map(function (item) {
    return item + "0";
});
console.log(mapTest);
console.log("forEach results:");
var forEachTest = simpleTest.forEach(function (item) {
    console.log(">> " + item);
});
console.log(forEachTest);
Array.prototype.reduce = function (param, reducer, initialValue) {
    console.log(param);
    console.log(reducer);
    var accumulatedValue = initialValue;
    for (var i = 0; i < this.length; i++) {
        console.log(this[i]);
        accumulatedValue = reducer(param, this[i], i, accumulatedValue);
    }
    return accumulatedValue;
};
