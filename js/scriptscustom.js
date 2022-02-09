//
// Scripts
// 

function testReturn() {
    return "testReturn  " + (new Date()) + "<p>";
}

function decode(value) {
   return value.replace('*', '@').replace(/~/g, '.').split("").reverse().join("");
}

function loadJSONLocalFile(f, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', f, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function initJsonGeoCodes() {
    loadJSONLocalFile('assets/resttest.json', function (response) {
    // Parse JSON string into object
    // var actual_JSON = JSON.parse(response);
    document.write(response);
});
}