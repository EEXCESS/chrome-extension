/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jquery-ui', 'tag-it'], function ($, ui, tagit) {

    var contentArea = $("<div id = 'eexcess-tabBar-contentArea'><div id='eexcess-tabBar-iframeCover'></div><div id='eexcess-tabBar-jQueryTabsHeader'><ul></ul><div id = 'eexcess-tabBar-jQueryTabsContent' class='flex-container intrinsic-container intrinsic-container-ratio' ></div></div></div>").hide();
    $('body').append(contentArea);
    var bar = $('<div id="searchBar" ' +
        ' style="position:fixed;width:100%;padding:5px;bottom:0;text-align:left;z-index:99999;"></div>');
    var taglist = $('<ul id="taglist"></ul>');
    var form = $('<form style="display:inline;"><input id="eexcess_search" type="text" size="20" /><input type="submit" /></form>');
    var toggler = $('<a href="#" id="eexcess_toggler" style="float:right;color:white;margin-right:10px;">&uArr;</a>');
    var resetToggle = $('<a href="#" id="eexcess_reset" style="float:right;color:white;margin-right:20px;font-size: 10px">reset</a>');
    var storage = chrome.storage.local;
    var mainTopic = $('<div id="eexcess_mainTopic"><p id="eexcess_mainTopicLabel">Liestal</p><p id="eexcess_mainTopicDesc">main topic(s)</p></div>');

    var $jQueryTabsHeader = $("#eexcess-tabBar-jQueryTabsHeader");
    var $iframeCover = $("#eexcess-tabBar-iframeCover");
    var $contentArea = $("#eexcess-tabBar-contentArea");

    bar.click(function (e) {
        e.preventDefault;
    });


    //sets size and position of the tab area according to previous changes by the user stored in chrome
    // local storage
    $(function setSizeAndPosition() {
        storage.get(null, function (result) {

            if (result.resizeWidth && result.dragPositionLeft) {
                $contentArea.css({
                    "height": result.resizeHeight,
                    "width": result.resizeWidth,
                    "top": result.dragPositionTop,
                    "left": result.dragPositionLeft
                });
                //console.log("Pos&&Size: Left: "+ result.dragPositionLeft + " Top:" +result.dragPositionTop);

            }
            //should be expendable now that resizestop also stores position
            else if (result.resizeWidth && !result.dragPosition) {

                $contentArea.css({"height": result.resizeHeight, "width": result.resizeWidth});
                //console.log("Size: Height: "+ result.resizeHeight + " Width:" +result.resizeWidth);
            }
            else if (result.dragPositionLeft && !result.resizeWidth) {
                $contentArea.css({
                    "top": result.dragPositionTop,
                    "left": result.dragPositionLeft
                });
                //console.log("Pos: Left: "+ result.dragPositionLeft + " Top:" +result.dragPositionTop);
            }
        });

    });


    return {
        init: function (triggerFunction) {


            //generates jquery-ui tabs TODO: icons? and move into external json
            $(function generateTabView() {
                var tabModel = {
                    "tabs": [
                        {
                            "id": "1",
                            "name": "SearchResultList",
                            //"icon": "icon.png",
                            // <iframe src="' + chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"

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
                        }
                    ]
                };


                $.each(tabModel.tabs, function (i, tab) {
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

                    }
                )
            });


// adding resize functionality
            $jQueryTabsHeader.resizable({
                handles: "all",
                minHeight: 200,
                minWidth: 250,
                alsoResize: [$iframeCover, $contentArea]
            });
// adding drag functionality to parent div
            $contentArea.draggable({
                scroll: "true"
            });


// on resize or drag start, show iframeCover to allow changes when mouse pointer is entering iframe area
            $jQueryTabsHeader.on("resizestart", function (event, ui) {
                $iframeCover.show();
            });
            $contentArea.on("dragstart", function (event, ui) {
                $iframeCover.show();
            });


//storing new values and hide iframeCover after size has been changed
            $jQueryTabsHeader.on("resizestop", function (event, ui) {
                var heightToStore = $jQueryTabsHeader.height();
                var widthToStore = $jQueryTabsHeader.width();
                storage.set({'resizeHeight': heightToStore}, function (result) {
                });
                storage.set({'resizeWidth': widthToStore}, function (result) {
                });

                //whenever a resize happens, but not a drag, the jQueryHeader position changes in another way than
                // the contentAreas position (due to jquery's alsoResize disregarding top and left). Therefore the
                // header's offset is stored as the new position.
                var positionToStoreTop = $contentArea.position().top + $jQueryTabsHeader.position().top;
                var positionToStoreLeft = $contentArea.position().left + $jQueryTabsHeader.position().left;
                //console.log("Resizestop, Pos+position. HeaderLeft: " +$jQueryTabsHeader.position().left);
                //console.log("Resizestop, Pos+position. HeaderTop: " +$jQueryTabsHeader.position().top);
                //console.log("Resizestop, Pos+position. CALeft: " +$contentArea.position().left);

                storage.set({'dragPositionTop': positionToStoreTop}, function (result) {
                });
                storage.set({'dragPositionLeft': positionToStoreLeft}, function (result) {
                });

                console.log("Resizestop, Pos+Offset. Left: " + positionToStoreLeft + "px Top: " + positionToStoreTop);
                $iframeCover.hide();
            });

//storing new values and hide iframeCover after position has been changed
            $contentArea.on("dragstop", function (event, ui) {
                var positionToStoreTop = $contentArea.position().top;
                var positionToStoreLeft = $contentArea.position().left;

                storage.set({'dragPositionTop': positionToStoreTop}, function (result) {
                });
                storage.set({'dragPositionLeft': positionToStoreLeft}, function (result) {
                });
                $iframeCover.hide();
                console.log("Dragstop. Left: " + positionToStoreLeft + "px Top: " + positionToStoreTop)
            });

            $(function () {
                form.submit(function (evt) {
                    evt.preventDefault();
                    var profile = {
                        contextKeywords: [{text: $('#eexcess_search').val(), weight: 1}]
                    };
                    triggerFunction(profile);
                });
                //bar.append(form);
                toggler.click(function (e) {
                    e.preventDefault();
                    if ($(this).text() === $("<div>").html("&uArr;").text()) {
                        $(this).text($("<div>").html("&dArr;").text());
                    } else {
                        $(this).text($("<div>").html("&uArr;").text());
                    }
                    contentArea.toggle('fast');

                });

                resetToggle.click(function (e) {
                    $contentArea.removeAttr('style');
                    $jQueryTabsHeader.removeAttr('style');
                    storage.remove('resizeHeight');
                    storage.remove('resizeWidth');
                    storage.remove('dragPositionLeft');
                    storage.remove('dragPositionTop');

                });


                var selectmenu = $('<select id="selectmenu"><option selected="selected">All</option><option>Persons</option><option>Locations</option></select>');
                bar.append(selectmenu);
                selectmenu.change(function (e) {
                    var type = $(this).children(':selected').text().toLowerCase();
                    if (type !== 'all') {
                        $.each(taglist.tagit('getTags'), function () {
                            if ($(this).data('properties').type === type) {
                                $(this).css('opacity', '1.0');
                            } else {
                                $(this).css('opacity', '0.4');
                            }
                        });
                    } else {
                        $(taglist.tagit('getTags').css('opacity', '1.0'));
                    }
                });

                bar.append($('<input type="submit" value="ok" id="searchbutton" />').click(function (e) {
                    var tags = taglist.tagit('assignedTags');

                    var profile = {
                        contextKeywords: []
                    };
                    $.each(tags, function () {
                        profile.contextKeywords.push({text: this, weight: 1});
                    });
                    triggerFunction(profile);
                }));


                //bar.append(mainTopic);

                taglist.tagit({
                    allowSpaces: true,
                    placeholderText: 'add keyword',
                    onTagClicked: function (e, ui) {
                        if ($(ui.tag[0]).css('opacity') === '0.4') {
                            $(ui.tag[0]).css('opacity', '1.0');
                        } else {
                            $(ui.tag[0]).css('opacity', '0.4');
                        }
                    }
                });
                bar.append(taglist);
                taglist.children('.tagit-new').addClass('no_bg');
                bar.append(toggler, resetToggle);
                $('body').append(bar);
            });
        },
        setLabels: function (entities) {
            taglist.tagit('removeAll');
            for (var type in entities) {
                if (entities.hasOwnProperty(type)) {
                    $.each(entities[type], function () {
                        this['type'] = type;
                        taglist.tagit('createTag', this.text, this);
                    });
                }
            }
        },
        show: function () {
            if (!contentArea.is(':visible')) {
                toggler.click();
            }
        }
    }


})
;



