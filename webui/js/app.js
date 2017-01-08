$(function() {
    // session selection
    $('.navbar-nav').on('click', '.viewSession', function() {
        let session = $(this).data('session');

        // let live = $(this).hasClass('live');
        // clearInterval(window.live);
        // if (live) {
        //     console.log('live');
        //     window.live = setInterval(() => viewSession(session), 1000);
        // }

        $('.navbar-nav .active').removeClass('active');
        $(this).parent('li').addClass('active');

        viewSession(session);
    });

    // view request or response
    $('.viewRequestResponse').click(function() {
        $(this).find('.request').toggleClass('btn-primary');
        $(this).find('.response').toggleClass('btn-primary');
        let session = $('#requests').data('session');
        let request = $('#requests .success').attr('id');
        let which = $(this).find('.request').hasClass('btn-primary') ? 'request' : 'response';
        if (session && request) viewRequestDetail(which, session, request);
    });

    // view a session
    function viewSession(id) {
        console.log(id);
        $('#view-request').hide();
        $('#view-session-info').show();
        $('#jsonViewer').html('');
        $('#requests tr.item').empty();
        $('#requests').data('session', id);
        $.getJSON('/api/session/' + id, function(data) {
            $('.info-session').html(`
                <div>${data.title}</div>
            `);
            if (data.files.length) {
                let first = data.files[0];
                let previous = data.files[0];
                $('.info-session').html(`
                    <div>Session started at ${moment(first.when).format('llll')}</div>
                    <div>${data.title}</div>
                `);
                data.files.forEach(d => {
                    let item = $('#request-template').clone().show().addClass('item').attr('id', d.id);
                    item.find('.id').data('id', d.id).text(d.id);
                    let fromStart = moment.duration(d.when - first.when).asSeconds().toFixed(1);
                    item.find('.when').text('+' + fromStart + 's');
                    let fromPrev = moment.duration(d.when - previous.when).asSeconds().toFixed(1);
                    item.find('.prev').text('+' + fromPrev + 's');
                    item.appendTo('#requests');
                    previous = d;
                });
            }
            viewSessionInfo(data);
        });
    }

    function viewSessionInfo(data) {
        if (window.mapobj) window.mapobj.remove();
        if (data.files.length > 0 && data.steps.length > 0) {
            let map = window.mapobj = L.map('map').setView([51.505, -0.09], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            let pts = Array.from(data.steps, pt => L.latLng(pt.lat, pt.lng));
            let path = L.polyline(pts, {color: 'red'}).addTo(map);
            let bounds = path.getBounds();
            map.fitBounds(bounds);
        }
    }

    function viewRequestDetail(which, session, request) {
        console.log('View request ' + request);
        $('#view-request').show();
        $('#view-session-info').hide();
        $('#jsonViewer').html('<h3>loading...</h3>');
        $('#' + request).addClass('success');
        $.getJSON(`/api/${which}/${session}/${request}`, function(data) {
            $('#jsonViewer').jsonViewer(data.decoded, {collapsed: true});
            $('#jsonViewer a').first().click();
            window.scrollTo(0, 0);
        });
    }

    // display a specific request
    $('#requests').on('click', '.id', function() {
        let session = $('#requests').data('session');
        let request = $(this).data('id');
        $('#requests .success').removeClass('success');
        $('.viewRequestResponse .request').addClass('btn-primary');
        $('.viewRequestResponse .response').removeClass('btn-primary');
        viewRequestDetail('request', session, request);
        return false;
    });

    // attach handler for session selection
    $.getJSON('/api/sessions', function(data) {
        let last = data.pop();
        $('#last-session').data('session', last.id);
        data.reverse().forEach(d => {
            $('#session-dropdown').append(`
                <li><a href="#" class='viewSession' data-session='${d.id}'>${d.title}</a></li>
            `);
        });
        viewSession(last.id);
        // window.live = setInterval(() => viewSession(last.id), 1000);
    });
});
