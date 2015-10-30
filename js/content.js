(function() {
    var run = function() {
        require(['c4/searchBar/searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes', 'jq_highlight'], function(searchBar, paragraphDetection, ner, iframes, jq_highlight) {
            var tabs = [{
                    "name": "SearchResultList",
                    "url": chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html'),
                    "icon": chrome.extension.getURL('visualization-widgets/SearchResultListVis/icon.png')
                }
                , {
                    "name": "Dashboard",
                    //"icon": "icon.png",
                    "url": "https://eexcess.github.io/visualization-widgets-files/Dashboard/index.html", //chrome.extension.getURL('visualization-widgets/Dashboard/index.html')
                    "icon": "http://rawgit.com/EEXCESS/visualization-widgets/master/Dashboard/icon.png"
                }, {
                    "name": "FacetScape",
                    "icon": chrome.extension.getURL('visualization-widgets/FacetScape/icon.png'),
                    "url": chrome.extension.getURL('visualization-widgets/FacetScape/index.html')
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
                            chrome.storage.local.get('queryCrumbs_history', function(res) {
                                var history = [];
                                if (res.queryCrumbs_history) {
                                    history = res.queryCrumbs_history;
                                    history.slice(Math.max(history.length - numItems, 0));
                                }
                                callback(history);
                            });
                        },
                        setHistory: function(history) {
                            chrome.storage.local.set({queryCrumbs_history: history});
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
                            if (typeof p[i].offset_map === 'undefined') {
                                p[i].offset_map = paragraphDetection.getOffsetMap($('#' + focusedParagraph.id).get(0));
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
                                p[tmp_idx].offsets = res.offsets;
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

            var highlights = [];
            // listen for keyword hover in the searchbar
            $(document).on('c4_keywordMouseEnter', function(e) {
//                console.log(e.originalEvent.detail);
//                console.log(focusedParagraph.offsets[e.originalEvent.detail.text]);
                //highlight($(focusedParagraph.elements[0]).parent(), e.originalEvent.detail.text, focusedParagraph.offsets[e.originalEvent.detail.text]);
                var offsets = focusedParagraph.offsets[e.originalEvent.detail.text];
                var map = focusedParagraph.offset_map;
                offsets.sort;
                var idx = 0;
                var current = map[0];
                for(var i = 0;i < offsets.length; i++) {
                    console.log(offsets[i]);
                    console.log(map);
                    for(var j = idx; j < map.length; j++) {
                        if(offsets[i] < map[j].offset) {
                            // TODO: highlight
                            var word = e.originalEvent.detail.text.toLowerCase();
                            var text = current.el.nodeValue.toLowerCase();
                            console.log(text);
                            if(text.indexOf(word, offsets[i] - current.offset) !== offsets[i] - current.offset) {
                                console.log('not perfectly matched ' + text.indexOf(word, offsets[i] - current.offset) + ' (' + offsets[i] + ')');
                            }
                            $(current.el.parentNode).highlight(word);
//                            jq_highlight.highlight(current.el, word);
                            idx = j;
                            break;
                        } else {
                            current = map[j];
                        }
                    }
                }
            });
            $(document).on('c4_keywordMouseLeave', function(e) {
//                console.log(e.originalEvent.detail);
//                console.log(focusedParagraph.offsets[e.originalEvent.detail.text]);
            });
        });
    };

    var kill = function() {
        require(['jquery'], function($) {
            // unbind focused paragraph listener
            $(document).unbind('paragraphFocused');
            // remove paragraph wrappers
            $.each($('.eexcess_detected_par'), function() {
                $(this).children(':first').unwrap();
            });
            // remove search bar & content pane
            $('#eexcess_searchBar').remove();
            $('#eexcess-tabBar-contentArea').remove();
            // unbind highlight listeners
            $(document).unbind('c4_keywordMouseEnter');
            $(document).unbind('c4_keywordMouseLeave');
        });
    };

    chrome.storage.local.get(['blacklist', 'EEXCESS_off', 'whitelist'], function(result) {
        console.log(window.location.href);
        if (result.EEXCESS_off) {
            if (result.whitelist && result.whitelist.indexOf(window.location.hostname) !== -1) {
                run();
            }
        } else if (!result.blacklist || result.blacklist.indexOf(window.location.hostname) === -1) {
            run();
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request && request.status === 'off') {
            if (request.site) {
                // local turnoff, check site
                if (request.site === window.location.hostname) {
                    kill();
                }
            } else {
                // global turn off, check whitelist
                chrome.storage.local.get('whitelist', function(response) {
                    if (!response.whitelist || response.whitelist.indexOf(window.location.hostname) === -1) {
                        kill();
                    }
                });
            }
        } else if (request && request.status === 'on') {
            if (request.site) {
                // local turn on, check site and EEXCESS not running
                if (request.site === window.location.hostname && !document.getElementById('eexcess_searchBar')) {
                    run();
                }
            } else {
                // global turn on, check blacklist and EEXCESS not running
                chrome.storage.local.get('blacklist', function(response) {
                    if ((!response.blacklist || response.blacklist.indexOf(window.location.hostname) === -1) && !document.getElementById('eexcess_searchBar')) {
                        run();
                    }
                });
            }
        }
    });
})();
