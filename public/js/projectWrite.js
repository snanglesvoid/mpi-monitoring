$(function() {
    InlineEditor
    .create($('#notes').get(0), {})
    .catch(console.error)

    $('#project-form').submit(function() {
        $('#notes-hidden').val($('#notes').html())
        $('.datepicker').each(function() {
            $(this).val($(this).datepicker('getDate'))
        })
    })

    $('.radio-container').click(function() {
        $(this).find('input').attr('checked', '')
        let label = $(this).find('input').attr('label')
        $(this).parent().find('span.textlabel').html(label)
        $(this).find('.middle').css('background', 'transparent')
        $(this).siblings().find('input').removeAttr('checked')
        $(this).siblings().find('.middle').css('background', 'white')
    })

    $('.radio-container').find('input[checked]').siblings('.middle').css('background', 'transparent')
    $('.radio-container').find('input[checked]').each(function() {
        let $input = $(this)
        let label = $input.attr('label')
        $input.parent().parent().find('span.textlabel').html(label)
    })
    $('#resetbtn').click(function() {
        let p = confirm('Sind Sie sicher dass Sie alle Änderungen verwefen möchten?')
        if (p) {
            window.location.reload()
        }
        else {
            return false
        }
    })

    let $tcCheckboxes = $('.checkbox-label.themecluster').find('input[type=checkbox]')
    $tcCheckboxes.on('click', function() {
        $(this).attr('checked', !$(this).attr('checked'))
        let count = $('.checkbox-label.themecluster').find('input[type=checkbox]').filter('[checked]').size()
        if (count > 3) {
            alert('Es können nicht mehr als drei Themencluster ausgewählt werden.')
            $(this).attr('checked', false)
        }
    })

    $('#measure').click()

    function pad(i) { 
        let s = String(i)
        while(s.length < 2) {s = "0" + s}
        return s
    }
    function dateTimeStr(d) { 
        return d && d.constructor.name =='Date' ? 
        `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}` : null
    }

    $('.filelist').each(function() {
        let $div = $(this)
        let path = $div.attr('path')

        $.get('/upload' + path, data => {
            console.log('get upload', JSON.stringify(data))
            let $tbody = $div.find('tbody')
            data.data.forEach((item,index) => {
                let classname = 'fileindex' + index
                $tbody.append(`
                    <tr class='${classname}'>
                        <td><a href='/download${path}/${item.filename}' download>
                            ${item.filename}
                        </a></td>
                        <td>${dateTimeStr(new Date(item.meta.birthtime))}</td>
                        <td><a class="delete"><span>
                            <i class='fa fa-trash'></i>
                        </a></td>
                    </tr>
                `)
                $tbody.find('.' + classname).find('a.delete').on('click', function(e) {
                    let p = confirm('Sind Sie sicher, dass Sie die Datei entfernen wollen?')
                    if (p) {
                        $.ajax({
                            url: '/upload' + path + '/' + item.filename,
                            type: 'DELETE',
                            success: function() { window.location.reload() },
                            error: function(err) { alert(err); },
                        })
                    }
                })
            })
            $tbody.append(`
                <tr class='add'>
                <td> Datei hinzufügen.</td>
                <td> </td>
                <td><a class="add"><span>
                    <i class='fa fa-plus'></i>
                </a></td>
                </tr>
            `)
            $tbody.find('a.add').on('click', function() {
                console.log('click')
                let $form = $('#file-form-dialog').find('form')
                $form.attr('action', '/upload' + path)

                let dialog = $('#file-form-dialog').get(0)
                console.log(dialog)

                if (typeof dialog.showModal === 'function') {
                    dialog.showModal()
                }
                else {
                    alert('the dialog api is not supported')
                }

                $form.submit(function() {
                    if (!$form.find('input[type="file"]').val()) {
                        return false
                    }
                })
                $form.find('button.cancel').on('click', function() {
                    dialog.close()
                })
            })
        })
    })
})