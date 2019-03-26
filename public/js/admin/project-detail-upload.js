/* oss.sheetjs.com (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */

/** drop target **/
var _target = document.getElementById('drop');
var _file = document.getElementById('file');
var _grid = document.getElementById('grid');
var _json = undefined;

/** Spinner **/
var spinner;

var _workstart = function() { spinner = new Spinner().spin(_target); }
var _workend = function() { spinner.stop(); }

/** Alerts **/
var _badfile = function() {
  alertify.alert('This file does not appear to be a valid Excel file.  If we made a mistake, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can take a look.', function(){});
};

var _pending = function() {
  alertify.alert('Please wait until the current file is processed.', function(){});
};

var _large = function(len, cb) {
  alertify.confirm("This file is " + len + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", cb);
};

var _failed = function(e) {
  console.log(e, e.stack);
  alertify.alert('We unfortunately dropped the ball here.  Please test the file using the <a href="/js-xlsx/">raw parser</a>.  If there are issues with the file processor, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can make things right.', function(){});
};

/* make the buttons for the sheets */
var make_buttons = function(sheetnames, cb) {
  var buttons = document.getElementById('buttons');
  buttons.innerHTML = "";
  sheetnames.forEach(function(s,idx) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.name = 'btn' + idx;
    btn.text = s;
    btn.classList += 'btn btn-default'
    btn.innerText = s;
    // var txt = document.createElement('p'); txt.innerText = s; btn.appendChild(txt);
    btn.addEventListener('click', function() { cb(idx); }, false);
    buttons.appendChild(btn);
  });
};

var cdg = canvasDatagrid({
  parentNode: _grid
});
cdg.style.height = '100%';
cdg.style.width = '100%';

function _resize() {
  _grid.style.height = (window.innerHeight - 200) + "px";
  _grid.style.width = (window.innerWidth - 100) + "px";
}
window.addEventListener('resize', _resize);

var _onsheet = function(json, sheetnames, select_sheet_cb) {
  console.log(json)
  _json = $.extend({}, json)
  $('#postbtn').attr('disabled', false)
  document.getElementById('footnote').style.display = "none";

  make_buttons(sheetnames, select_sheet_cb);

  /* show grid */
  _grid.style.display = "block";
  _resize();

  /* set up table headers */
  var L = 0;
  json.forEach(function(r) { if(L < r.length) L = r.length; });
  console.log(L);
  for(var i = json[0].length; i < L; ++i) {
    json[0][i] = "";
  }

  /* load data */
  cdg.data = json;
};

/** Drop it like it's hot **/
DropSheet({
  file: _file,
  drop: _target,
  on: {
    workstart: _workstart,
    workend: _workend,
    sheet: _onsheet,
    foo: 'bar'
  },
  errors: {
    badfile: _badfile,
    pending: _pending,
    failed: _failed,
    large: _large,
    foo: 'bar'
  }
})


function uploadJSON () {
    console.log(_json)
    let spin = new Spinner().spin(document.getElementById('top'))
    $('#postbtn').attr('disabled', true)
    let id = $('#projectId').val()
    $.post('/project-detail-upload', {data: _json, projectId: id} , (response) => {
        console.log(response)
        spin.stop()
        $('#postbtn').attr('disabled', false)
        if (response.status == 'error') {
          $('#out').html(`
            <h3>Etwas ist schief gelaufen:</h3>
            <p>${response.message}</p>
          `)
        }
        else {
          let errors = response.errors || {}
          $('#out').html(`
            <h3>Tabelle erfolgreich hochgeladen</h3>
            <p>${response.message}</p>

            <h3>Warnungen:</h3>
            ${
              Object.keys(errors).length == 0 ? '<p>keine</p>'
              : Object.keys(error).map(key => '<p>In Zeile'+key+':'+errors[key]+'</p>').reduce((a,b) => a + b, '')
            }
          `)
        }
        $('#out').css('display', 'block')
    }).fail((error) => {
      $('#out').html(`
        <h3>Etwas ist schief gelaufen:</h3>
        <p>${JSON.stringify(error)}</p>
      `)
    })
}