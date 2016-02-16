require(['c4/searchBar/searchBar', 'c4/APIconnector', 'util', 'c4/iframes', 'up/constants'], function(searchBar, api, util, iframes, up_constants) {
    var logLevel = up_constants.STORAGE_PREFIX + up_constants.LOGGING_LEVEL;
    chrome.storage.sync.get(['uuid', logLevel], function(result) {
        var uuid;
        if (result.uuid) {
            uuid = result.uuid;
        } else {
            uuid = util.randomUUID();
            chrome.storage.sync.set({uuid: uuid});
        }
        var manifest = chrome.runtime.getManifest();
        var origin = {
            userID: uuid,
            clientType: manifest.name + "/chrome-extension",
            clientVersion: manifest.version
        };
        if (result[logLevel]) {
            api.init({origin: origin, loggingLevel: result[logLevel]});
        } else {
            api.init({origin: origin});
        }
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName === 'sync' && changes[logLevel]) {
                api.setLoggingLevel(changes[logLevel].newValue);
            }
        });
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName === 'local' && changes.showPopupBubble) {
                searchBar.showNotificationBubble(changes.showPopupBubble.newValue);
            }
        });
        var lastQuery;
        var qcRefresh = function(request, sender, sendResponse) {
            if (request && request.method === 'updateQueryCrumbs') {
                searchBar.refreshQC();
            }
        };
        var lastQueryHandler = function(msg) {
            if (msg.data.event && msg.data.event === 'eexcess.currentResults' && lastQuery) {
                iframes.sendMsgAll({
                    event: 'eexcess.newResults',
                    data: lastQuery
                });
            }
        };
        var loggingHandler = function(msg) {
            if (msg.data.event && msg.data.event.startsWith('eexcess.log')) {
                api.logMsgHandler(msg.data);
            }
        };
        var unloadHandler = function(e) {
            var module = searchBar.getCurrentModule();
            if (module) {
                api.sendLog(api.logInteractionType.moduleClosed, {
                    origin: {module: 'c4/searchBar'},
                    content: {name: module}
                });
            }
        };
        var visibilityChangeHandler = function() {
            var module = searchBar.getCurrentModule();
            if (document.hidden && module) {
                api.sendLog(api.logInteractionType.moduleClosed, {
                    origin: {module: 'c4/searchBar'},
                    content: {name: module}
                });
            } else if (!document.hidden && module) {
                api.sendLog(api.logInteractionType.moduleOpened, {
                    origin: {module: 'c4/searchBar'},
                    content: {name: module}
                });
            }
        };
        var run = function() {
            window.addEventListener('message', loggingHandler);
            window.addEventListener('message', lastQueryHandler);
            window.addEventListener('beforeunload', unloadHandler);
            document.addEventListener('visibilitychange', visibilityChangeHandler);
            require(['c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes', 'jq_highlight'], function(paragraphDetection, ner, iframes, jq_highlight) {
                var tabs = [{
                        "name": "SearchResultList",
                        "url": chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html'),
                        "icon": chrome.extension.getURL('visualization-widgets/SearchResultListVis/icon.png')
                    }
                    , {
                        "name": "Dashboard",
                        "url": chrome.extension.getURL('visualization-widgets/Dashboard/index.html'),
                        "icon": chrome.extension.getURL('visualization-widgets/Dashboard/icon.png'),
                        "deferLoading": true
                    }, {
                        "name": "FacetScape",
                        "icon": chrome.extension.getURL('visualization-widgets/FacetScape/icon.png'),
                        "url": chrome.extension.getURL('visualization-widgets/FacetScape/index.html'),
                        "deferLoading": true
                    }];
                searchBar.init(tabs, {
                    storage: chrome.storage.local,
                    imgPATH: chrome.extension.getURL('js/lib/c4/searchBar/img/'),
                    profile: {
                        addCategories: function(categories) {
                            // do nothing
                        }
                    },
                    queryFn: function(queryProfile, callback) {
                        chrome.runtime.sendMessage({method: 'triggerQuery', data: queryProfile}, function(response) {
                            if (response.status === 'success') {
                                lastQuery = response.data;
                            }
                            callback(response);
                        });
                    },
                    origin: origin,
                    queryCrumbs: {
                        active: true,
                        storage: {
                            getHistory: function(callback) {
                                chrome.runtime.sendMessage({method: 'qcGetHistory'}, callback);
                            },
                            setHistory: function(history) {
                                chrome.runtime.sendMessage({method: 'qcSetHistory', data: history});
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
                var focusedParagraph = {};
//                chrome.storage.local.get('queryCrumbs_history', function(res) {
//                    console.log(res);
//                });
                $(document).on('paragraphFocused', function(evt) {
                    var lastOutOfFocus = false;
                    if (typeof focusedParagraph !== 'undefined' && typeof focusedParagraph.elements !== 'undefined') {
                        var outTop = $(focusedParagraph.elements[0]).parent().offset().top < $(window).scrollTop();
                        var outBottom = $(focusedParagraph.elements[0]).parent().offset().top > $(window).scrollTop() + $(window).height();
                        if (outTop || outBottom) {
                            lastOutOfFocus = true;
                        }
                    } else {
                        lastOutOfFocus = true;
                    }
                    var focusEvent = evt.originalEvent.detail;
                    if (focusEvent.paragraph !== null && focusedParagraph !== focusEvent.paragraph && (lastOutOfFocus || focusEvent.trigger === 'click')) {
                        // set focused paragraph variable
                        focusedParagraph = focusEvent.paragraph;
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
                        var immediately = (focusEvent.trigger && focusEvent.trigger === 'click');
                        if (entitiesExracted) {
                            searchBar.setQuery(p[tmp_idx].query.contextKeywords, immediately);
                        } else {
                            paragraphDetection.paragraphToQuery($(focusedParagraph.elements[0]).parent().text(), function(res) {
                                if (typeof res.query !== 'undefined') {
                                    p[tmp_idx].query = res.query;
                                    p[tmp_idx].offsets = res.offsets;
                                    searchBar.setQuery(res.query.contextKeywords, immediately);
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
                    offsets.sort(function(a, b) {
                        return a - b;
                    });
                    var idx = 0;
                    var current = map[0];
                    for (var i = 0; i < offsets.length; i++) {
                        for (var j = idx; j < map.length; j++) {
                            if (offsets[i] < map[j].offset || j === map.length - 1) {
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
                                            comparison += char;
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
            window.removeEventListener('message', lastQueryHandler);
            window.removeEventListener('beforeunload', unloadHandler);
            document.removeEventListener('visibilitychange', visibilityChangeHandler);
            unloadHandler();
            lastQuery = null;
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
});
