/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jqueryui'], function ($) {

        var resizeCounter = 0;
        var contentArea = $("<div id = 'contentArea'><div id='iframeCover'></div><div id='jQueryTabsHeader'><ul></ul><div id = 'jQueryTabsContent' class='flex-container intrinsic-container intrinsic-container-ratio' ></div></div></div>").hide();
        $('body').append(contentArea);
        var bar = $('<div' +
            ' style="position:fixed;width:100%;height:20px;padding:5px;bottom:0;background-color:black;text-align:left;z-index:99999;"></div>');
        var form = $('<form style="display:inline;"><input id="eexcess_search" type="text" size="20" /><input type="submit" /></form>');
        var toggler = $('<a href="#" style="float:right;color:white;margin-right:10px;">&uArr;</a>');

        var storage = chrome.storage.local;

        return {
            init: function (triggerFunction) {

                //sets size and position of the tab area according to previous adjustments
                $(function setSizeAndPosition() {
                    storage.get(null, function (result) {

                            if (result.resizeWidth && result.dragPosition) {
                                $("#contentArea").attr("style", "height:" + result.resizeHeight + "px;" + "width:" + result.resizeWidth + "px; top:" + result.dragPosition.top + "px;" + "left:" + result.dragPosition.left + "px;");
                            }
                            if (result.resizeWidth && !result.dragPosition) {
                                console.log("heck");
                                $("#contentArea").attr("style", "height:" + result.resizeHeight + "px;" + "width:" + result.resizeWidth + "px;");
                            }
                            if (result.dragPosition && !result.resizeWidth) {
                                $("#contentArea").attr("style", "top:" + result.dragPosition.top + "px;" + "left:" + result.dragPosition.left + "px;");

                            }
                        }
                    )
                    ;

                });

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
                                chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"',
                                "renderedHead": "",
                                "renderedContent": ""
                            },
                            //{
                            //    "id": "2",
                            //    "name": "PowerSearch",
                            //    //"icon": "icon.png",
                            //    "content": '<iframe src="' +
                            //    chrome.extension.getURL('visualization-widgets/PowerSearch/powersearch/index.html') + '"',
                            //    "renderedHead": "",
                            //    "renderedContent": ""
                            //}, {
                            //    "id": "3",
                            //    "name": "Dashboard",
                            //    //"icon": "icon.png",
                            //    "content": '<iframe src="' +
                            //    chrome.extension.getURL('visualization-widgets/Dashboard/uRank/test/index.html') + '"',
                            //    "renderedHead": "",
                            //    "renderedContent": ""
                            //}
                        ]
                    };

                    $.each(tabModel.tabs, function (i, tab) {
                            tab.renderedHead = $("<li><a href='#tabs-" + tab.id + "'>" + tab.name + " </a></li>");
                            $("#jQueryTabsHeader ul").append(
                                tab.renderedHead);
                            // add tab content corresponding to tab titles
                            tab.renderedContent = $("<div id='tabs-" + tab.id + "'>" + tab.content + "</div>"
                            );
                            $("#jQueryTabsContent").append(
                                tab.renderedContent
                            );
                            // following 3 functions derived from jQuery-UI Tabs
                            $("#jQueryTabsHeader").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
                            $("#jQueryTabsHeader li").removeClass("ui-corner-top").addClass("ui-corner-left");
                            $("#jQueryTabsHeader").tabs("refresh");
                            $("#iframeCover").hide();
                            $("#contentArea").addClass("flex-start");

                        }
                    )
                });

                //de-comment to experience jump behavior, comment in dragstop listener function
                // // adding handle to resize ResultArea
                //$("#jQueryTabsHeader").resizable({
                //    handles: "all",
                //    minHeight: 200,
                //    minWidth: 250,
                //    maxWidth: 800,
                //    aspectRatio: "60%"
                //
                //});

                // adding handle to resize ResultArea (after drag to ensure no jumping)
                $("#jQueryTabsHeader").resizable({
                    handles: "all",
                    minHeight: 200,
                    minWidth: 250,
                    // maxWidth: 800,
                    aspectRatio: "80%",
                    alsoResize: $("#contentArea")

                });


                $("#contentArea").draggable({
                    scroll: "true"
                });

                $("#jQueryTabsHeader").on("resizestart", function (event, ui) {
                    //if (resizeCounter == 0) {
                    //    //resizeCounter += 1;
                    //    $("#contentArea").css({ "top": "auto","right": "0","bottom": "0","left": "auto"});
                    //console.log(resizeCounter);
                    //}
                    $("#iframeCover").show();
                   //var newPosition = $("#jQueryTabsHeader").position();
                   // $("#contentArea").css({ "top": '"'+newPosition.right+'"',"right": "auto","bottom": "auto","left": '"'+newPosition.left+'"'});


                });

                $("#contentArea").on("dragstart", function (event, ui) {
                    $("#iframeCover").show();

                });
                //Listening to size change and saving values into storage
                $("#jQueryTabsHeader").on("resizestop", function (event, ui) {
                    //console.log(resizeCounter);
                    var heightToStore = $("#jQueryTabsHeader").height();
                    var widthToStore = $("#jQueryTabsHeader").width();

                    storage.set({'resizeHeight': heightToStore}, function (result) {
                    });
                    storage.set({'resizeWidth': widthToStore}, function (result) {
                    });
                    $("#iframeCover").hide();
                    //if (resizeCounter == 0) {
                    //    resizeCounter += 1;
                    //    $("#contentArea").css({"top": "auto", "right": "0", "bottom": "0", "left": "auto"});
                    //    console.log(resizeCounter);
                    //}
                    //var newPosition = $("#jQueryTabsHeader").offset();
                    //$("#contentArea").css({ "top": newPosition.top,"right": "auto","bottom": "auto","left": newPosition.left});
                     });


                //Listening to position change and saving values into storage, see jquery-ui offset()
                $("#contentArea").on("dragstop", function (event, ui) {

                    var positionToStore = $("#contentArea").position();
                    console.log(positionToStore);
                    storage.set({'dragPosition': positionToStore}, function (result) {
                    });

                    $("#iframeCover").hide();


                });

                $(function () {
                    form.submit(function (evt) {
                        evt.preventDefault();
                        var profile = {
                            contextKeywords: [{text: $('#eexcess_search').val(), weight: 1}]
                        };
                        triggerFunction(profile);
                    });
                    bar.append(form);
                    toggler.click(function (e) {
                        e.preventDefault();
                        if ($(this).text() === $("<div>").html("&uArr;").text()) {
                            $(this).text($("<div>").html("&dArr;").text());
                        } else {
                            $(this).text($("<div>").html("&uArr;").text());
                        }
                        contentArea.slideToggle('fast');

                    });
                    bar.append(toggler);
                    $('body').append(bar);
                });
            },
            show: function () {
                if (!contentArea.is(':visible')) {
                    toggler.click();
                }
            }
        }


    }
)
;



