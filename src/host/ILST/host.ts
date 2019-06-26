console.log("Testing various ES6 methods:");
let simpleTest = ["a", "b", "c", "d"];
let advTest = [
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
let filterTest = simpleTest.filter(item => {
  return /a|d/.test(item);
});
console.log(filterTest);

console.log("find results:");
let findTest = advTest.find(item => {
  return item.key == 1;
});
console.log(`${findTest.key} ? ${findTest.val}`);

console.log("Map results:");
let mapTest = simpleTest.map(item => {
  return item + "0";
});
console.log(mapTest);

console.log("forEach results:");
let forEachTest = simpleTest.forEach(item => {
  console.log(">> " + item);
});
console.log(forEachTest);

Array.prototype.reduce = function(param, reducer, initialValue) {
  console.log(param);
  console.log(reducer);
  let accumulatedValue = initialValue;
  for (var i = 0; i < this.length; i++) {
    console.log(this[i]);
    accumulatedValue = reducer(param, this[i], i, accumulatedValue);
  }
  return accumulatedValue;
};
