/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jqueryui'], function ($) {


    var contentArea = $("<div id = 'contentArea'><div id='tabs-header' class='tabs-area'><ul></ul><div id = 'tabs-content' class='flex-container intrinsic-container intrinsic-container-ratio'></div></div></div>").hide();
    $('body').append(contentArea);
    var bar = $('<div' +
        ' style="position:fixed;width:100%;height:20px;padding:5px;bottom:0;background-color:black;text-align:left;z-index:99999;"></div>');
    var form = $('<form style="display:inline;"><input id="eexcess_search" type="text" size="20" /><input type="submit" /></form>');
    var toggler = $('<a href="#" style="float:right;color:white;margin-right:10px;">&uArr;</a>');
    return {
        init: function (triggerFunction) {


            $(function generateTabView() {


                var tabModel = {
                    "tabs": [
                        {
                            "id": "1",
                            "name": "SearchResultList",
                            "icon": "icon.png",
                            // <iframe src="' + chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"

                            "content": '<iframe src="' +
                            chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"',
                            "renderedHead": "",
                            "renderedContent": ""
                        },
                        {
                            "id": "2",
                            "name": "PowerSearch",
                            "icon": "icon.png",
                            "content": '<iframe src="' +
                            chrome.extension.getURL('visualization-widgets/PowerSearch/powersearch/index.html') + '"',
                            "renderedHead": "",
                            "renderedContent": ""
                        }, {
                            "id": "3",
                            "name": "Dashboard",
                            "icon": "icon.png",
                            "content": '<iframe src="' +
                            chrome.extension.getURL('visualization-widgets/Dashboard/uRank/test/index.html') + '"',
                            "renderedHead": "",
                            "renderedContent": ""
                        }]
                };

                $.each(tabModel.tabs, function (i, tab) {
                        tab.renderedHead = $("<li><a href='#tabs-" + tab.id + "'>" + tab.name + " </a></li>");
                        $("#tabs-header ul").append(
                            tab.renderedHead);


                        // add tab content corresponding to tab titles
                        tab.renderedContent = $("<div id='tabs-" + tab.id + "'>" + tab.content + "</div>"
                        );
                        $("#tabs-content").append(
                            tab.renderedContent
                        );
                        // following 3 functions derived from jQuery-UI Tabs
                        $("#tabs-header").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
                        $("#tabs-header li").removeClass("ui-corner-top").addClass("ui-corner-left");
                        $("#tabs-header").tabs("refresh");

                        $("#tabs-content").addClass("flex-start");

                    }
                )


                // adding handle to resize ResultArea
                $("#tabs-header").resizable({
                    handles: "all",
                    minHeight: 200,
                    minWidth: 350,
                    aspectRatio: "60%"
                });
                $("#tabs-header").draggable({
                    scroll: "true"
                });
            }),


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

                        //$("#resizable").resizable({
                        //    handles: "nw"
                        //
                        //});


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


});



