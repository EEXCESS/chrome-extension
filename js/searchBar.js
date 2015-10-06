/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jquery-ui', 'tag-it', 'c4/APIconnector', 'c4/iframes'], function($, ui, tagit, api, iframes) {
    var util = {
        preventQuery: false,
        resizeForText: function(text, minify) {
            var $this = $(this);
            var $span = $this.parent().find('span');
            $span.text(text);
            var $inputSize = $span.width();
            if ($this.width() < $inputSize || minify) {
                $this.css("width", $inputSize);
            }
        },
        queryUpdater: function() {
            loader.show();
            result_indicator.hide();
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                // get keywords
                lastQuery.contextKeywords = taglist.tagit('getActiveTagsProperties');
                // get main topic
                var mainTopic = mainTopicLabel.data('properties');
                if (mainTopic.text && mainTopic.text !== '') {
                    lastQuery.contextKeywords.push(mainTopic);
                }
                // query
                settings.queryFn(lastQuery, resultHandler);
            }, settings.queryModificationDelay);
        },
        setMainTopic: function(topic) {
            topic.isMainTopic = true;
            mainTopicLabel.val(topic.text).data('properties', topic);
            this.resizeForText.call(mainTopicLabel, topic.text, true);
        }
    };
    var results = {};
    var lastQuery = {};
    var settings = {
        queryFn: api.query,
        imgPATH: 'img/',
        queryModificationDelay: 500,
        queryDelay: 2000
    };
    var contentArea = $("<div id = 'eexcess-tabBar-contentArea'><div id='eexcess-tabBar-iframeCover'></div><div id='eexcess-tabBar-jQueryTabsHeader'><ul></ul><div id = 'eexcess-tabBar-jQueryTabsContent' class='flex-container intrinsic-container intrinsic-container-ratio' ></div></div></div>").hide();
    $('body').append(contentArea);
    var bar = $('<div id="eexcess_searchBar"></div>');
    var left = $('<div id="eexcess_barLeft"></div>');
    var logo;
    var loader;
    var result_indicator;
    var timeout;

    var selectmenu = $('<select id="eexcess_selectmenu"><option selected="selected">All</option><option>Persons</option><option>Locations</option></select>');
    selectmenu.change(function(e) {
        lastQuery = {contextKeywords: []};
        var type = $(this).children(':selected').text().toLowerCase();
        if (type !== 'all') {
            $.each(taglist.tagit('getTags'), function() {
                if ($(this).data('properties').type && $(this).data('properties').type.toLowerCase() + 's' === type) {
                    $(this).css('opacity', '1.0');
                } else {
                    $(this).css('opacity', '0.4');
                }
            });
        } else {
            $(taglist.tagit('getTags').css('opacity', '1.0'));
        }
        util.queryUpdater();
    });
    left.append(selectmenu);

    var mainTopicDiv = $('<div id="eexcess_mainTopic"></div>');
    mainTopicDiv.droppable({
        activeClass: "mainTopicDropActive",
        hoverClass: "mainTopicDropHover",
        accept: ".eexcess",
        drop: function(event, ui) {
            var tag = $(ui.draggable[0]).data('properties');
            var old_topic = mainTopicLabel.data('properties');
            util.preventQuery = true;
            taglist.tagit('removeTagByLabel', tag.text);
            util.preventQuery = false;
            taglist.tagit('createTag', old_topic.text, old_topic);
            util.setMainTopic(tag);
            util.queryUpdater();
        }
    });
    left.append(mainTopicDiv);
    var mainTopicLabel = $('<input id="eexcess_mainTopicLabel" />');
    mainTopicLabel.on('focus', function() {
        var $this = $(this)
                .one('mouseup.mouseupSelect', function() {
            $this.select();
            return false;
        })
                .one('mousedown', function() {
            $this.off('mouseup.mouseupSelect');
        })
                .select();
    });
    mainTopicLabel.keypress(function(e) {
        var $this = $(this);
        if (e.keyCode === 13) {
            $this.blur();
            util.setMainTopic({text:$this.val()});
            util.queryUpdater();
        } else {
            if (e.which && e.charCode) {
                var c = String.fromCharCode(e.keyCode | e.charCode);
                util.resizeForText.call($this, $this.val() + c, false);
            }
        }
    });
    mainTopicDiv.append(mainTopicLabel);
    var mainTopicLabelHidden = $('<span style="display:none" class="eexcess_hiddenLabelSpan"></span>');
    mainTopicLabel.after(mainTopicLabelHidden);
    var mainTopicDesc = $('<p id="eexcess_mainTopicDesc">main topic</p>');
    mainTopicDiv.append(mainTopicDesc);

    var main = $('<div id="eexcess_barMain"></div>');

    var taglist = $('<ul id="eexcess_taglist" class="eexcess"></ul>');
    taglist.tagit({
        allowSpaces: true,
        placeholderText: 'add keyword',
        beforeTagAdded: function(event, ui) {
            $(ui.tag).addClass('eexcess');
            $(ui.tag).draggable({
                revert: 'invalid',
                scroll: false,
                stack: '#eexcess_mainTopic',
                appendTo: 'body',
                start: function() {
                    $(this).css('z-index', '100000');
                },
                stop: function() {
                    $(this).css('z-index', '99999');
                }
            });
        },
        afterTagAdded: function(e, ui) {
            if (!util.preventQuery) {
                util.queryUpdater();
            }
        },
        afterTagRemoved: function(e, ui) {
            if (!util.preventQuery) {
                util.queryUpdater();
            }
        },
        onTagClicked: function(e, ui) {
            if ($(ui.tag[0]).css('opacity') === '0.4') {
                $(ui.tag[0]).css('opacity', '1.0');
            } else {
                $(ui.tag[0]).css('opacity', '0.4');
            }
            util.queryUpdater();
        }
    });
    main.append(taglist);
    var taglistDesc = $('<p id="eexcess_taglistDesc">Drag and Drop keywords to change the main topic, click to (de)activate</p>');
    taglist.after(taglistDesc);

    var right = $('<div id="eexcess_barRight"></div>');
    bar.append(left, main, right);
    $('body').append(bar);

    var storage = chrome.storage.local;
    var $jQueryTabsHeader = $("#eexcess-tabBar-jQueryTabsHeader");
    var $iframeCover = $("#eexcess-tabBar-iframeCover");
    var $contentArea = $("#eexcess-tabBar-contentArea");

    var tabModel = {
        tabs: []
    };


    window.onmessage = function(msg) {
        // visualization has triggered a query -> widgets must be visible
        if (msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
            lastQuery = msg.data.data;
            iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: msg.data.data});
            result_indicator.hide();
            loader.show();
            settings.queryFn(lastQuery, function(response) {
                if (response.status === 'success') {
                    results = response.data;
                    loader.hide();
                    result_indicator.text(response.data.totalResults + ' results');
                    result_indicator.show();
                    iframes.sendMsgAll({event: 'eexcess.newResults', data: results});
                } else {
                    iframes.sendMsgAll({event: 'eexcess.error', data: response.data});
                    result_indicator.text('error');
                    result_indicator.show();
                }
            });
        }
        // console.log(e.data);
        // do something
    };

    var resultHandler = function(response) {
        if (response.status === 'success') {
            results = response.data;
            loader.hide();
            result_indicator.text(response.data.totalResults + ' results');
            result_indicator.show();
        } else {
            loader.hide();
            result_indicator.text('error');
            result_indicator.show();
        }
    };

    return {
        init: function(tabs, config) {
            settings = $.extend(settings, config);
            logo = $('<img id="eexcess_logo" src="' + settings.imgPATH + 'eexcess_Logo.png" />');
            right.append(logo);
            loader = $('<img id="eexcess_loader" src="' + settings.imgPATH + 'eexcess_loader.gif" />').hide();
            right.append(loader);
            result_indicator = $('<a id="eexcess_result_indicator" href="#">16 results</a>').click(function(e) {
                e.preventDefault();
                iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: lastQuery});
                iframes.sendMsgAll({event: 'eexcess.newResults', data: results});
                if (!contentArea.is(':visible')) {
                    contentArea.show('fast');
                }
            }).hide();
            right.append(result_indicator);

            //sets size and position of the tab area according to previous changes by the user stored in chrome
            // local storage
            $(function setSizeAndPosition() {
                storage.get(null, function(result) {

                    if (result.resizeWidth && result.dragPosition) {
                        $contentArea.css({
                            "height": result.resizeHeight,
                            "width": result.resizeWidth,
                            "top": result.dragPosition.top,
                            "left": result.dragPosition.left
                        });

                    }
                    //should be expendable now that resizestop also stores position
                    if (result.resizeWidth && !result.dragPosition) {

                        $contentArea.css({"height": result.resizeHeight, "width": result.resizeWidth});
                    }
                    if (result.dragPosition && !result.resizeWidth) {
                        $contentArea.css({"top": result.dragPosition.top, "left": result.dragPosition.left});
                    }
                });

            });

            //generates jquery-ui tabs TODO: icons? and move into external json
            tabModel.tabs = tabs;
            $.each(tabModel.tabs, function(i, tab) {
                tab.renderedHead = $("<li><a href='#tabs-" + tab.id + "'>" + tab.name + " </a></li>");
                $("#eexcess-tabBar-jQueryTabsHeader ul").append(
                        tab.renderedHead);
                // add tab content corresponding to tab titles
                tab.renderedContent = $("<div id='tabs-" + tab.id + "'>" + tab.content + "</div>"
                        );
                $("#eexcess-tabBar-jQueryTabsContent").append(
                        tab.renderedContent
                        );
                // following 3 functions derived from jQuery-UI Tabs

                $jQueryTabsHeader.tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
                $("#jQueryTabsHeader li").removeClass("ui-corner-top").addClass("ui-corner-left");
                $jQueryTabsHeader.tabs("refresh");
                $jQueryTabsHeader.tabs({active: 0});
                $iframeCover.hide();
            });
            // adding resize functionality
            $jQueryTabsHeader.resizable({
                handles: "all",
                minHeight: 200,
                minWidth: 250,
                alsoResize: $iframeCover
            });
            // adding drag functionality to parent div
            $jQueryTabsHeader.draggable({
                scroll: "true"
            });
            // on resize or drag start, show iframeCover to allow changes when mouse pointer is entering iframe area
            $jQueryTabsHeader.on("resizestart", function(event, ui) {
                $iframeCover.show();
            });
            $contentArea.on("dragstart", function(event, ui) {
                $iframeCover.show();
            });
            //storing new values and hide iframeCover after size has been changed
            $jQueryTabsHeader.on("resizestop", function(event, ui) {
                var heightToStore = $jQueryTabsHeader.height();
                var widthToStore = $jQueryTabsHeader.width();
                storage.set({'resizeHeight': heightToStore}, function(result) {
                });
                storage.set({'resizeWidth': widthToStore}, function(result) {
                });

                //whenever a resize happens, but not a drag, the jQueryHeader position changes in another way than
                // the contentAreas position (due to jquery's alsoResize disregarding top and left). Therefore the
                // header's offset is stored as the new position.
                var positionToStore = $jQueryTabsHeader.offset();
                storage.set({'dragPosition': positionToStore}, function(result) {
                });
                $iframeCover.hide();
            });
            //storing new values and hide iframeCover after position has been changed
            $contentArea.on("dragstop", function(event, ui) {
                var positionToStore = $contentArea.position();
                storage.set({'dragPosition': positionToStore}, function(result) {
                });
                $iframeCover.hide();
            });

        },
        setQuery: function(contextKeywords) {
            util.preventQuery = true;
            taglist.tagit('removeAll');
            $.each(contextKeywords, function() {
                if (this.isMainTopic) {
                    // TODO: support multiple topics?
                    util.setMainTopic(this);
                } else {
                    taglist.tagit('createTag', this.text, this);
                }
            });
            util.preventQuery = false;
            clearTimeout(timeout);
            setTimeout(function() {
                loader.show();
                result_indicator.hide();
                lastQuery = {contextKeywords: contextKeywords};
                settings.queryFn({contextKeywords: contextKeywords}, resultHandler);
            }, settings.queryDelay);
        }
    };
});



