"use strinct"

var K = function () {
	const list = [];

	this.add = (str) => {
		var hits = 0;
		list.forEach((item) => {
			if (item == str) hits++
		})

		list.push(str);

		return hits;
	}
}
/*
const k = new K()

console.log(k.add('q'))
console.log(k.add('q'))

console.log(k.add('sq'))
console.log(k.add('e'))
console.log(k.add('sq'))
console.log(k.add('q'))*/

module.exports = K;