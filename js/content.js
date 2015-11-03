require(['c4/searchBar/searchBar', 'c4/APIconnector', 'util'], function(searchBar, api, util) {
    var qcRefresh = function(request, sender, sendResponse) {
        if (request && request.method === 'updateQueryCrumbs') {
            searchBar.refreshQC();
        }
    };
    var loggingHandler = function(msg) {
        chrome.storage.sync.get('uuid', function(result) {
            var uuid;
            if (result.uuid) {
                uuid = result.uuid;
            } else {
                uuid = util.randomUUID();
                chrome.storage.sync.set({uuid: uuid});
            }
            api.init({
                origin: {
                    userID: uuid,
                    clientType: "chrome-extension",
                    clientVersion: chrome.runtime.getManifest().version
                }
            });
            if (msg.data.event && msg.data.event.startsWith('eexcess.log')) {
                switch (msg.data.event) {
                    case 'eexcess.log.moduleOpened':
                        api.sendLog(api.logInteractionType.moduleOpened, msg.data.data);
                        break;
                    case 'eexcess.log.moduleClosed':
                        api.sendLog(api.logInteractionType.moduleClosed, msg.data.data);
                        break;
                    case 'eexcess.log.moduleStatisticsCollected':
                        api.sendLog(api.logInteractionType.moduleStatisticsCollected, msg.data.data);
                        break;
                    case 'eexcess.log.itemOpened':
                        api.sendLog(api.logInteractionType.itemOpened, msg.data.data);
                        break;
                    case 'eexcess.log.itemClosed':
                        api.sendLog(api.logInteractionType.itemClosed, msg.data.data);
                        break;
                    case 'eexcess.log.itemCitedAsImage':
                        api.sendLog(api.logInteractionType.itemCitedAsImage, msg.data.data);
                        break;
                    case 'eexcess.log.itemCitedAsText':
                        api.sendLog(api.logInteractionType.itemCitedAsText, msg.data.data);
                        break;
                    case 'eexcess.log.itemCitedAsHyperlink':
                        api.sendLog(api.logInteractionType.itemCitedAsHyperlink, msg.data.data);
                        break;
                    case 'eexcess.log.itemRated':
                        api.sendLog(api.logInteractionType.itemRated, msg.data.data);
                        break;
                    default:
                        console.log('unknown log method: ' + msg.data.event);
                        break;
                }
            }
        });
    };
    var run = function() {
        window.addEventListener('message', loggingHandler);
        require(['c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes', 'jq_highlight'], function(paragraphDetection, ner, iframes, jq_highlight) {
            var tabs = [{
                    "name": "SearchResultList",
                    "url": chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html'),
                    "icon": chrome.extension.getURL('visualization-widgets/SearchResultListVis/icon.png')
                }
                , {
                    "name": "Dashboard",
                    "url": chrome.extension.getURL('visualization-widgets/Dashboard/index.html'),
                    "icon": chrome.extension.getURL('visualization-widgets/Dashboard/icon.png')
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
                        getHistory: function(callback) {
                            chrome.storage.local.get('queryCrumbs_history', function(res) {
                                callback(res.queryCrumbs_history);
                            });
                        },
                        setHistory: function(history) {
                            chrome.storage.local.set({queryCrumbs_history: history});
                        }
                    },
                    updateTrigger: function() {
                        chrome.runtime.sendMessage(({method: 'updateQueryCrumbs'}));
                    }
                }
            });
            chrome.runtime.onMessage.addListener(qcRefresh);
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
                if (evt.originalEvent.detail !== null && lastY < $(window).scrollTop() + $(window).height() - 90 && focusedParagraph !== evt.originalEvent.detail) {
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
                        paragraphDetection.paragraphToQuery($(focusedParagraph.elements[0]).parent().text(), function(res) {
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
            // listen for keyword hover in the searchbar
            var highlights = [];
            $(document).on('c4_keywordMouseEnter', function(e) {
                var offsets = focusedParagraph.offsets[e.originalEvent.detail.text];
                var map = paragraphDetection.getOffsetMap($('#' + focusedParagraph.id).get(0));
                offsets.sort;
                var idx = 0;
                var current = map[0];
                for (var i = 0; i < offsets.length; i++) {
                    for (var j = idx; j < map.length; j++) {
                        if (offsets[i] < map[j].offset) {
                            var word = e.originalEvent.detail.text.toLowerCase();
                            var text = current.el.nodeValue.toLowerCase();
                            if (text.indexOf(word, offsets[i] - current.offset) !== offsets[i] - current.offset) {
// not an exact match
                                var text = text.slice(offsets[i] - current.offset);
                                var firstWord = text.split(/[^a-zA-ZäöüÄÖÜ]/)[0];
                                // see how many chars are equal from the start
                                var comparison = '';
                                for (var k = 0; k < word.length; k++) {
                                    var char = word.charAt(k);
                                    if (char === text.charAt(k)) {
                                        comparison += char
                                    } else {
                                        break;
                                    }
                                }
// if the first word is longer than the matched char sequence, use the first word
                                if (firstWord.length < comparison) {
                                    word = comparison;
                                } else {
                                    word = firstWord;
                                }
                            }
                            highlights.push(current.el.parentNode);
                            $(current.el.parentNode).highlight(word, {className: 'eexcess_highlight'});
                            idx = j;
                            break;
                        } else {
                            current = map[j];
                        }
                    }
                }
            });
            $(document).on('c4_keywordMouseLeave', function(e) {
                highlights.forEach(function(val) {
                    $(val).unhighlight({className: 'eexcess_highlight'});
                });
                highlights = [];
            });
        });
    };
    var kill = function() {
        window.removeEventListener('message', loggingHandler);
        chrome.runtime.onMessage.removeListener(qcRefresh);
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
});
