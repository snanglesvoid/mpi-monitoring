$(function() {
    function badfile() {
        alertify.alert('Diese Datei ist keine gültige .csv Datei')
    }
    function pending() {
        alertify.alert('Bitte noch einen moment warten...')
    }
    function large(len, cb) {
        alertify.alert('Diese Datei ist ' + len + ' bytes gross. Das koennte ein bisschen dauern...', cb)
    }
    function failed(e) {
        console.error(e, e.stack)
        alertify.alert('Es ist etwas schiefgelaufen...')
    }

    let spinner

    
    let $grid = $('#grid')
    let $file = $('#file')
    let $target = $('#drop')
    let data = []

    let workstart = function() { spinner = new Spinner().spin($target.get(0)) }
    let workend = function() { spinner.stop() }

    let cdg = canvasDatagrid({
        parentNode: $grid.get(0)
    })

    window['_cdg'] = cdg
    cdg.style.height = '100%'
    cdg.style.with = '100%'

    function resize() {
        $grid.css('height', (window.innerHeight - 200) + "px")
        $grid.css('width', (window.innerWidth - 100) + "px")
    }

    $(window).resize(resize)

    function fileChosen(json, sheetnames, select_sheet_cb) {
        console.log(json)
        $('#postbtn').attr('disabled', false)
        $('#footnote').remove()
        $grid.css('display', 'block')
        resize()
        
        let L = 0
        json.forEach(function(r) { if (L < r.length) L = r.length; })
        for (let i = 0; i < json.length; ++i) {
            for (let j = 0; j < L; ++j) {
                if (json[i][j] === undefined) json[i][j] = "n/a"
            }
        }
    
        console.log(L)

        cdg.data = json
    }

    function downloadText(text, filename) {
        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        element.setAttribute('download', filename)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const escapeMap = {
        auml: 'ä',
        uuml: 'ü',
        ouml: 'ö',
        quot: '"',
        szlig: 'ß',
        nbsp: ' ',
    }

    function decodeHtml(str) {
        console.log(str)
        return str
            .replace(/%C3%A4/g, 'ä')
            .replace(/%C3%BC/g, 'ü')
            .replace(/%C3%B6/g, 'ö')
            .replace(/%C3%9F/g, 'ß')
            .replace(/ÃƒÂ¤/g, 'ä')
            .replace(/&#(\d+);/g, (_, dec) => {
                console.log('replace', dec, escapeMap(dec))
                if (!escapeMap(dec)) { alert(dec) }
                return escapeMap[dec] || ''}
            )
    }

    function downloadExcel() {
        let header = 'sep=|\n'

        let content = cdg.data.map(r => {
            // console.log('original row', r)
            return r
                .map(x => x.replace(/\|/g, ''))
                .map(x => x.replace(/<br\s*[\/]?>/gi, ' '))
                .map(decodeHtml)
                .reduce((a, b) => a + '|' + b)
            }
        ).reduce((a, b) => a + '\n' + b, '')
    
        let text = header + content
        let filename = 'monitoring-download-' + (new Date().toDateString()).replace(' ', '_') + '.csv'

        downloadText(text, filename)
    }

    $('#postbtn').on('click', downloadExcel)

    DropSheet({
        file: $file.get(0),
        drop: $target.get(0),
        on: {
            workstart: workstart,
            workend: workend,
            sheet: fileChosen,
            foo: 'bar'
        },
        errors: {
            badfile: badfile,
            pending: pending,
            failed: failed,
            large: large,
            foo: 'bar'
        }
    })
})