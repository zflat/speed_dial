var reader = new FileReader();
reader.onload = function(e) {
    document.getElementById('file-encoded').value = reader.result;
}
var fileEncoderHandler = function(e) {
    var files = e.target.files;
    var file = files[0];
    if(file) {
        reader.readAsDataURL(file);
    } else {
        document.getElementById('file-encoded').value = '';
    }
}

var saveHandler = function(e) {
    e.preventDefault()    
}
var exportHandler = function(e) {
    e.preventDefault()
}
var importerInitHandler = function(e) {
    document.getElementById('settings-importer').style="display:block";
    e.preventDefault()
}
var importClearHandler = function(e) {
    document.getElementById('settings-importer').style="display:hidden";
    e.preventDefault()
}

document.addEventListener('DOMContentLoaded',function() {
    document.getElementById("file-img").onchange=fileEncoderHandler;
    document.getElementById("btn-save").onclick=saveHandler;
    document.getElementById("btn-export").onclick=exportHandler;
    document.getElementById("btn-import").onclick=importerInitHandler;
    document.getElementById("btn-clear-import").onclick=importClearHandler;
},false);

// Trigger a download
// window.location.href = "data:application/octet,"+encodeURIComponent("{'style':'','links':''}");
