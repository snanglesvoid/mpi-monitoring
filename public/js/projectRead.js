$(function() {       
    $('.datepicker').datepicker({
        prevText: '&#x3c;zurück', prevStatus: '',
        prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
        nextText: 'Vor&#x3e;', nextStatus: '',
        nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
        currentText: 'heute', currentStatus: '',
        todayText: 'heute', todayStatus: '',
        clearText: '-', clearStatus: '',
        closeText: 'schließen', closeStatus: '',
        monthNames: ['Januar','Februar','März','April','Mai','Juni',
        'Juli','August','September','Oktober','November','Dezember'],
        monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun',
        'Jul','Aug','Sep','Okt','Nov','Dez'],
        dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
        dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
        dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
        showMonthAfterYear: false,
        //- showOn: 'both',
        //- buttonImage: '/images/calendar.png',
        buttonImageOnly: true,
        dateFormat:'dd. MM yy',
    } )
    $('.datepicker').each(function() {
        let $dp = $(this)
        if ($dp.attr('m-date') && $dp.attr('m-date') != '') {
            $dp.datepicker('setDate', new Date($dp.attr('m-date')))
        }
    })

    $('.accordion-toggle').click(function(e) {
        console.log('click')
        $(this).toggleClass('active')
        $(this).next('.accordion-group').toggleClass('active')
        e.preventDefault()
        return false;
    })
    function showTooltip() {
        console.log('show tooltip')
        let $span = $(this)
        $('span.info').css('z-index', 8)
        $span.css('z-index', 11)
        $span.css('border', 'none')
        let text = $span.attr('data-text')

        let x = $span.offset().left
        let y = $span.offset().top - $(window).scrollTop()

        $('.tooltip').remove()

        $('#body').append(`
            <div class='tooltip'
                 style='top: ${y}px; left: ${x}px;'
            >
                
            </div>
        `)
        $('.tooltip').html($span.find('.info-content').html())
            .on('mouseout', hideTooltip)
            .on('click', hideTooltip)
            .animate({
                opacity: 1
            }, 500)
    }
    function hideTooltip() {
        $('.tooltip')
            .animate({
                opacity: 0
            }, 500, function() {
                $('span.info').css('z-index', 8)
                $('span.info').css('border', '1px solid green')
                $('.tooltip').remove()
            })
    }
    
    $('span.info').on('mouseover', showTooltip)
    //- $('span.info').on('mouseout', hideTooltip)
})