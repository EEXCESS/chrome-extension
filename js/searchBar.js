/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jquery-ui', 'tag-it', 'c4/APIconnector', 'c4/iframes'], function($, ui, tagit, api, iframes) {
    var results = {};
    var lastQuery = {};
    api.init({base_url: 'http://eexcess-demo.know-center.tugraz.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'}); // TODO: remove
    var query = api.query;
    var imgPATH = 'img/';
    var contentArea = $("<div id = 'eexcess-tabBar-contentArea'><div id='eexcess-tabBar-iframeCover'></div><div id='eexcess-tabBar-jQueryTabsHeader'><ul></ul><div id = 'eexcess-tabBar-jQueryTabsContent' class='flex-container intrinsic-container intrinsic-container-ratio' ></div></div></div>").hide();
    $('body').append(contentArea);
    var bar = $('<div id="eexcess_searchBar"></div>');
    var left = $('<div id="eexcess_barLeft"></div>');
    var logo;
    var loader;
    var result_indicator;

    var selectmenu = $('<select id="eexcess_selectmenu"><option selected="selected">All</option><option>Persons</option><option>Locations</option></select>');
    selectmenu.change(function(e) {
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
    });
    left.append(selectmenu);

    var mainTopicDiv = $('<div id="eexcess_mainTopic"><p id="eexcess_mainTopicLabel"></p><p id="eexcess_mainTopicDesc">main topic</p></div>');
    left.append(mainTopicDiv);
    var main = $('<div id="eexcess_barMain"></div>');

    var taglist = $('<ul id="eexcess_taglist" class="eexcess"></ul>');
    taglist.tagit({
        allowSpaces: true,
        placeholderText: 'add keyword',
        beforeTagAdded: function(event, ui) {
            $(ui.tag).addClass('eexcess');
        },
        onTagClicked: function(e, ui) {
            if ($(ui.tag[0]).css('opacity') === '0.4') {
                $(ui.tag[0]).css('opacity', '1.0');
            } else {
                $(ui.tag[0]).css('opacity', '0.4');
            }
        }
    });
    main.append(taglist);

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
            query(lastQuery, function(response) {
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

    return {
        init: function(tabs, imgPath, queryFn) {
            if (typeof queryFn !== 'undefined') {
                query = queryFn;
            }
            if (typeof imgPath !== 'undefined') {
                imgPATH = imgPath;
            }
            logo = $('<img id="eexcess_logo" src="' + imgPATH + 'eexcess_Logo.png" />');
            right.append(logo);
            loader = $('<img id="eexcess_loader" src="' + imgPATH + 'eexcess_loader.gif" />').hide();
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
            taglist.tagit('removeAll');
            $.each(contextKeywords, function() {
                if (this.isMainTopic) {
                    // TODO: support multiple topics?
                    // TODO: topic attributes
                    $('#eexcess_mainTopicLabel').text(this.text);
                } else {
                    taglist.tagit('createTag', this.text, this);
                }
            });
            loader.show();
            result_indicator.hide();
            lastQuery = {contextKeywords: contextKeywords};
            query({contextKeywords: contextKeywords}, function(response) {
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
            });
        }
    };
});



