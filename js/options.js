require(['./common'], function(common) {
    require(['jquery', 'c4/APIconnector', 'jqueryui'], function($, api, jui) {
        api.init({base_url: 'https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/'});
        var $numResults = $('#numResults');
        var $notificationBubble = $('#notification_bubble');
        // store current values and inform background script about update
        var update = function() {
            var selectedSources = [];
            $.each($('#partnerList input:checked'), function() {
                selectedSources.push($(this).data('props'));
            });
            chrome.storage.sync.set({numResults: $numResults.val(), selectedSources: selectedSources}, function() {
                chrome.runtime.sendMessage({method: 'optionsUpdate'});
            });
        };
        // get numResults from storage, set to '80' if not present
        chrome.storage.sync.get('numResults', function(result) {
            if (result.numResults) {
                $numResults.val(result.numResults);
            } else {
                $numResults.val(80);
            }
        });
        // numResults must be int in range 1-100
        $numResults.change(function() {
            $numResults.val(parseInt($numResults.val()));
            if ($numResults.val() < 1) {
                $numResults.val(1);
            }
            if ($numResults.val() > 100) {
                $numResults.val(100);
            }
            update();
        });


        chrome.storage.local.get('showPopupBubble', function(result) {
            if (typeof result.showPopupBubble === 'undefined' || result.showPopupBubble) {
                $notificationBubble.prop('checked', 'checked');
            }
        });

        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName === 'local' && changes.showPopupBubble) {
                $notificationBubble.prop('checked', changes.showPopupBubble.newValue);
            }
        });

        $notificationBubble.change(function() {
            chrome.storage.local.set({showPopupBubble: $notificationBubble.prop('checked')});
        });

        // slider settings
        chrome.storage.sync.get('preferences', function(res) {
            var prefs = {
                text: 20,
                video: 40,
                picture: 80,
                openLicence: 0,
                expertLevel:0
            };
            if (res.preferences) {
                prefs = res.preferences;
            } else {
                chrome.storage.sync.set({preferences: prefs});
            }
            $('#slider_img').slider({
                min: 0,
                max: 100,
                value: prefs.picture,
                slide: function(event, ui) {
                    prefs.picture = ui.value;
                    chrome.storage.sync.set({preferences: prefs});
                }
            });
            $('#slider_vid').slider({
                min: 0,
                max: 100,
                value: prefs.video,
                slide: function(event, ui) {
                    prefs.video = ui.value;
                    chrome.storage.sync.set({preferences: prefs});
                }
            });
            $('#slider_text').slider({
                min: 0,
                max: 100,
                value: prefs.text,
                slide: function(event, ui) {
                    prefs.text = ui.value;
                    chrome.storage.sync.set({preferences: prefs});
                }
            });
            $('#slider_ol').slider({
                min: 0,
                max: 100,
                value: prefs.openLicence,
                slide: function(event, ui) {
                    prefs.openLicence = ui.value;
                    chrome.storage.sync.set({preferences: prefs});
                }
            });
        });

        // partner list
        var $sources = $('#sources');
        api.getRegisteredPartners(function(res) {
            $('#loader').hide();
            if (res.status === 'success') {
                var $partnerList = $('<ul id="partnerList">');
                $.each(res.data.partner, function() {
                    var data = {
                        systemId: this.systemId,
                        favIconURI: this.favIconURI
                    };
                    var li = $('<li></li>');
                    var input = $('<input type="checkbox" name="' + this.systemId + '" value="' + this.systemId + '" /><img src="' + this.favIconURI + '" class="partnerIcon" />').data('props', data).change(update);
                    li.append(input).append(' ' + this.systemId);
                    $partnerList.append(li);
                });
                $sources.append($partnerList);
                // get selection from storage
                chrome.storage.sync.get('selectedSources', function(res) {
                    if (res.selectedSources) {
                        res.selectedSources.forEach(function(val) {
                            $('#partnerList input[name="' + val.systemId + '"]').prop('checked', true);
                        });
                    }
                });
            } else {
                $sources.append('Failed to retrieve available providers, showing only currently selected');
                chrome.storage.sync.get('selectedSources', function(res) {
                    if (res.selectedSources && res.selectedSources.length > 0) {
                        var $partnerList = $('<ul id="partnerList">');
                        res.selectedSources.forEach(function(val) {
                            var li = $('<li></li>');
                            var input = $('<input type="checkbox" name="' + val.systemId + '" value="' + val.systemId + '" /><img src="' + val.favIconURI + '" class="partnerIcon" />').data('props', val).prop('checked', true).change(update);
                            ;
                            li.append(input).append(' ' + val.systemId);
                            $partnerList.append(li);
                        });
                        $sources.append($partnerList);
                    }
                });
            }
        });
    });
});