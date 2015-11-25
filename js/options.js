require(['./common'], function(common) {
    require(['jquery', 'c4/APIconnector'], function($, api) {
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
                            $('#partnerList input[name=' + val.systemId + ']').prop('checked', true);
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