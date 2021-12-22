//
// Scripts
// 

function testReturn() {
    return "fromFunction";
}

function decode(value) {
   return value.replace('*', '@').replace(/~/g, '.').split("").reverse().join("");
}