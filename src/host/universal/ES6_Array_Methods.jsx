Array.prototype.filter = function(param) {
  var filtered = [];
  for (let i = 0; i < this.length; i++)
    if (param(this[i], i, this)) filtered.push(this[i]);
  return filtered;
};

// Array.prototype.find = function(param) {
//   var filtered = [];
//   console.log(this);
//   // for (let i = 0; i < this.length; i++)
//   //   if (param(this[i], i, this)) return this[i];
// };

// var result = [{ n: "a" }, { b: "something" }, { c: 2300 }].find(function(val) {
//   return val;
// });
// console.log(result);
