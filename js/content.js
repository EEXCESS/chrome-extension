require(['searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes'], function(searchBar, paragraphDetection, ner, iframes) {
    var tabs = [{
            "id": "1",
            "name": "SearchResultList",
            "content": '<iframe src="' +
                    chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html') + '"',
            "renderedHead": "",
            "renderedContent": ""
        }
        , {
            "id": "2",
            "name": "Dashboard",
            //"icon": "icon.png",
            "content": '<iframe src="' +
                    chrome.extension.getURL('visualization-widgets/Dashboard/index.html') + '"',
            "renderedHead": "",
            "renderedContent": ""
        }, {
            "id": "3",
            "name": "FacetScape",
            //"icon": "icon.png",
            "content": '<iframe src="'
                    +
                    chrome.extension.getURL('visualization-widgets/FacetScape/index.html') + '"',
            "renderedHead": "",
            "renderedContent": ""
        }, {
            id: 4,
            name: "PowerSearch",
            "content": '<iframe src="' +
                    chrome.extension.getURL('visualization-widgets/PowerSearch/index.html') + '"',
            "renderedHead": "",
            "renderedContent": ""
        }];
    searchBar.init(tabs, chrome.extension.getURL('js/lib/c4/searchBar/img/'));

    // detect paragraphs
    var p = paragraphDetection.getParagraphs();

    // selection listener
    var selection;
    $(document).mouseup(function() {
        var tmp_selection = document.getSelection().toString();
        if (tmp_selection && tmp_selection !== '' && tmp_selection !== selection) {
            selection = tmp_selection;
            paragraphDetection.paragraphToQuery(selection, function(res) {
                if (typeof res.query !== 'undefined') {
                    searchBar.setQuery(res.query.contextKeywords);
                } else {
                    // TODO: error handling?
                    // optional error message in res.error
                }
            });
        }
    });

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

    var lastY = 0;
    $(document).mousemove(function(e) {
        lastY = e.pageY;
    });
    var focusedParagraph = {};
    $(document).on('paragraphFocused', function(evt) {
        // prevent focused paragraph updates when the user moves the mouse down to the searchbar
        // update only when focused paragraph changes
        if (lastY < $(window).scrollTop() + $(window).height() - 90 && focusedParagraph !== evt.originalEvent.detail) {
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
                    if (typeof res.query !== 'undefined') {
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