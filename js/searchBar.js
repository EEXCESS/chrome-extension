/**
 * A module to add a search bar to the bottom of a page. Currently under development and only pushed to the repository for demo purposes. Therefore not well documented and subject to changes.
 *
 * @module c4/searchBar
 */
define(['jquery', 'jqueryui'], function ($) {


    var contentArea = $("<div id='tabs' class='contentArea'> " +
        "<div id='tabs-header'><ul></ul>" +
        "<div id = 'tabs-content'></div></div></div>").hide();


    //var testArea = ('<div id ="tabs">' +
    //    "<div id='tabs-header'><ul></ul></div>" +
    //    "<div id = 'tabs-content'></div></div>" +
    //    "style='position:fixed;width:60%;height:60%;bottom:20px;right:0px;background-color:white;border:1px solid black;z-index:99999;'></div>"
    //);
//    var contentArea = $('<div id ="contentArea"> <iframe src="' + chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '" style="position:fixed;width:60%;height:60%;bottom:20px;right:0px;background-color:white;border:1px solid black;z-index:99999"></div>').hide();
    //var contentArea = $('<div id ="resizable"> <iframe src="' + chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '" style="position:fixed;width:60%;height:60%;bottom:20px;right:0px;background-color:white;border:1px solid black;z-index:99999"></div>').hide();

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
                            "name": "Tab One",
                            "icon": "icon.png",
                            // <iframe src="' + chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"

                            "content": '<iframe src="' +
                            chrome.extension.getURL('visualization-widgets/SearchResultList/index.html') + '"',
                            "renderedHead": "",
                            "renderedContent": ""
                        },
                        {
                            "id": "2",
                            "name": "Tabula Rasa",
                            "icon": "icon.png",
                            "content": "Test",
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
                    }
                )


                // adding handle to resize ResultArea
                $("#tabs-header").resizable({
                    handles: "nw"
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



