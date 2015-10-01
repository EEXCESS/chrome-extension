require(['searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes'], function(searchBar, paragraphDetection, ner, iframes) {
    searchBar.init(function(profile) {
        chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
        iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: profile});
        searchBar.show();
    });
    window.onmessage = function(msg) {
        if (msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
            chrome.runtime.sendMessage({method: 'triggerQuery', data: msg.data.data});
            iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: msg.data.data});
        }
        // console.log(e.data);
        // do something
    };

    // detect paragraphs
    var p = paragraphDetection.getParagraphs();
    console.log('PARAGRAPHS');
    console.log(p);


    // selection listener
//    $(document).mouseup(function() {
//        var selection = paragraphDetection.getSelection(p);
//        if (selection.selection.length > 0) {
//            var profile = {
//                // TODO: split terms
//                contextKeywords: [{
//                        text: selection.selection,
//                        weight: 1.0
//                    }]
//            };
//            if (selection.entities) {
//                profile.contextNamedEntities = selection.entities;
//            }
//            // TODO: provide reason
//            chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
//            iframes.sendMsgAll({event: 'eexcess.queryTriggered'});
//            searchBar.show();
//        }
//        console.log(selection);
//    });

    // augment links
//    $(function() {
//        paragraphDetection.augmentLinks(
//                $('.' + paragraphDetection.getSettings().classname),
//                chrome.extension.getURL('media/icons/19.png'),
//                function(profile) {
//                    // TODO: provide reason
//                    chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
//                    iframes.sendMsgAll({event: 'eexcess.queryTriggered'});
//                    searchBar.show();
//                },
//                paragraphDetection.getSettings().classname, p
//                );
//    });

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        console.log(msg);
        if (msg.method) {
            switch (msg.method) {
                case 'newResults':
                    iframes.sendMsgAll({event: 'eexcess.newResults', data: msg.data});
                    break;
                case 'error':
                    iframes.sendMsgAll({event: 'eexcess.error', data: msg.data});
                    break;
                default:
                    console.log('unknown method');
                    break;
            }
        } else {
            console.log('method not specified');
        }
    });

    var lastY = 0;
    $(document).mousemove(function(e) {
        lastY = e.pageY;
    });
    var focusedParagraph;
    $(document).on('paragraphFocused', function(evt) {
        // prevent focused paragraph updates when the user moves the mouse down to the searchbar
        if (lastY < $(window).scrollTop() + $(window).height() - 90) {
            console.log('paragraph focused');
            // set focused paragraph variable
            focusedParagraph = evt.originalEvent.detail;
            // reset border on all paragraphs
            p.forEach(function(v1) {
                $(v1.elements[0]).parent().css('border', '1px solid silver');
            });
            // green border for focused paragraph
            $(focusedParagraph.elements[0]).parent().css('border', '2px solid #1d904e');
            // check if entities have already been extracted for paragraph
            var entitiesExracted = false;
            var tmp_idx;
            for (var i = 0; i < p.length; i++) {
                if (p[i].id === focusedParagraph.id) {
                    if (typeof p[i].query !== 'undefined') {
                        entitiesExracted = true;
                    }
                    tmp_idx = i;
                    break;
                }
            }
            if (entitiesExracted) {
                searchBar.setQuery(p[tmp_idx].query.contextKeywords);
            } else {
                paragraphDetection.paragraphToQuery($(focusedParagraph.elements[0]).text(), function(res) {
                    if(typeof res.query !== 'undefined') {
                        p[tmp_idx].query = res.query;
                        searchBar.setQuery(res.query.contextKeywords);
                    } else {
                        // TODO: error handling?
                        // optional error message in res.error
                    }
                });
            }
        }
    });


    paragraphDetection.findFocusedParagraph();
});