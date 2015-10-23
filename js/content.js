(function () {
    var run = function () {
        require(['c4/searchBar/searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes'], function (searchBar, paragraphDetection, ner, iframes) {
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
                queryFn: function (queryProfile, callback) {
                    chrome.runtime.sendMessage({method: 'triggerQuery', data: queryProfile}, function (response) {
                        callback(response);
                    });
                }});

            // detect paragraphs
            var p = paragraphDetection.getParagraphs();

            // selection listener
            var selection;
            $(document).mouseup(function () {
                var tmp_selection = document.getSelection().toString();
                if (tmp_selection && tmp_selection !== '' && tmp_selection !== selection) {
                    selection = tmp_selection;
                    paragraphDetection.paragraphToQuery(selection, function (res) {
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
            $(document).mousemove(function (e) {
                lastY = e.pageY;
            });
            var focusedParagraph = {};
            $(document).on('paragraphFocused', function (evt) {
                // prevent focused paragraph updates when the user moves the mouse down to the searchbar
                // update only when focused paragraph changes
                if (lastY < $(window).scrollTop() + $(window).height() - 90 && focusedParagraph !== evt.originalEvent.detail) {
                    // set focused paragraph variable
                    focusedParagraph = evt.originalEvent.detail;
                    // reset border on all paragraphs
                    p.forEach(function (v1) {
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
                        paragraphDetection.paragraphToQuery($(focusedParagraph.elements[0]).text(), function (res) {
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
            p.forEach(function (v1) {
                $(v1.elements[0]).parent().css('border', '1px dotted silver');
            });
            paragraphDetection.findFocusedParagraphSimple();
        });
    };

    var kill = function () {
        require(['jquery'], function ($) {
            $(document).unbind('paragraphFocused');
            $.each($('.eexcess_detected_par'), function () {
                $(this).children(':first').unwrap();
            });
            $('#eexcess_searchBar').remove();
            $('#eexcess-tabBar-contentArea').remove();
        });
    };

    chrome.storage.local.get(['blacklist', 'EEXCESS_off', 'whitelist'], function (result) {
        console.log(window.location.href);
        if (result.EEXCESS_off) {
            if (result.whitelist && result.whitelist.indexOf(window.location.hostname) !== -1) {
                run();
            }
        } else if (!result.blacklist || result.blacklist.indexOf(window.location.hostname) === -1) {
            run();
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request && request.status === 'off') {
            if (request.site) {
                // local turnoff, check site
                if(request.site === window.location.hostname) {
                    kill();
                }
            } else {
                // global turn off, check whitelist
                chrome.storage.local.get('whitelist', function (response) {
                    if (!response.whitelist || response.whitelist.indexOf(window.location.hostname) === -1) {
                        kill();
                    }
                });
            }
        } else if (request && request.status === 'on') {
            if (request.site) {
                // local turn on, check site and EEXCESS not running
                if (request.site === window.location.hostname && $('#eexcess_searchBar').length === 0) {
                    run();
                }
            } else {
                // global turn on, check blacklist and EEXCESS not running
                chrome.storage.local.get('blacklist', function (response) {
                    if ((!response.blacklist || response.blacklist.indexOf(window.location.hostname) === -1) && $('#eexcess_searchBar').length === 0) {
                        run();
                    }
                });
            }
        }
    });
})();