require(['c4/searchBar/searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes'], function(searchBar, paragraphDetection, ner, iframes) {
    var tabs = [{
            "name": "SearchResultList",
            "url": chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html')
        }
        , {
            "name": "Dashboard",
            //"icon": "icon.png",
            "url": "https://eexcess.github.io/visualization-widgets/Dashboard/index.html?a"//chrome.extension.getURL('visualization-widgets/Dashboard/index.html')
        }, {
            "name": "FacetScape",
            //"icon": "icon.png",
            "url": chrome.extension.getURL('visualization-widgets/FacetScape/index.html')
        }, {
            name: "PowerSearch",
            "url": chrome.extension.getURL('visualization-widgets/PowerSearch/index.html')
        }];
    searchBar.init(tabs, {
        storage: chrome.storage.local,
        imgPATH: chrome.extension.getURL('js/lib/c4/searchBar/img/'),
        queryFn: function(queryProfile, callback) {
            chrome.runtime.sendMessage({method: 'triggerQuery', data: queryProfile}, function(response) {
                callback(response);
            });
        },
        queryCrumbs: {
            active: true,
            storage: {
                getHistory: function(numItems, callback) {
                    chrome.storage.local.get('queryCrumbs_history', function(res){
                        var history = [];
                        if(res.queryCrumbs_history) {
                            history = res.queryCrumbs_history;
                            history.slice(Math.max(history.length - numItems, 0));
                        }
                        callback(history);
                    });
                },
                setHistory: function(history) {
                    chrome.storage.local.set({queryCrumbs_history:history});
                }
            }
        }
    });

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

    // might be removed when using simple focusDetection
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
                $(v1.elements[0]).parent().css('border', '1px dotted silver');
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

    // border on all extracted paragraphs
    p.forEach(function(v1) {
        $(v1.elements[0]).parent().css('border', '1px dotted silver');
    });
    paragraphDetection.findFocusedParagraphSimple();
});