require(['../js/common'], function (common) {
    require(['jquery'], function ($) {
        chrome.tabs.query({'active': true}, function (tabs) {
            var url = tabs[0].url;
            var tabid = tabs[0].id;
            var tmp = document.createElement('a');
            tmp.href = url;
            var currentHostname = tmp.hostname;

            chrome.storage.local.get(['blacklist', 'EEXCESS_off', 'whitelist'], function (result) {
                if (result.EEXCESS_off) {
                    $('#power_txt').text('switch on');
                    $('#power_img').attr('src', '../media/buttons/green.png');
                    // whitelist
                    if (result.whitelist && result.whitelist.indexOf(currentHostname) !== -1) {
                        $('#tmp_txt').text('switch off for ' + currentHostname);
                    } else {
                        $('#tmp_txt').text('switch on for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/green.png');
                    }
                } else {
                    // blacklist
                    if (result.blacklist && result.blacklist.indexOf(currentHostname) !== -1) {
                        $('#tmp_txt').text('switch on for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/green.png');
                    } else {
                        $('#tmp_txt').text('switch off for ' + currentHostname);
                    }
                }



                $('#power').click(function (e) {
                    var power_txt = $('#power_txt');
                    if (power_txt.text() === 'switch on') {
                        chrome.storage.local.set({EEXCESS_off: false});
                        power_txt.text('switch off');
                        $('#power_img').attr('src', '../media/buttons/red.png');
                        chrome.tabs.query({}, function (tabs) {
                            for (var i = 0, len = tabs.length; i < len; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, {status: 'on'});
                            }
                        });
                    } else {
                        chrome.storage.local.set({EEXCESS_off: true});
                        power_txt.text('switch on');
                        $('#power_img').attr('src', '../media/buttons/green.png');
                        chrome.tabs.query({}, function (tabs) {
                            for (var i = 0, len = tabs.length; i < len; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, {status: 'off'});
                            }
                        });
                    }
                });
                $('#tmp').click(function (e) {
                    if(result.EEXCESS_off) {
                        // whitelist
                    } else {
                        // blacklist
                    }
                    // msg content script
                    
                    var tmp_txt = $('#tmp_txt');
                    if (tmp_txt.text() === 'switch off for ' + currentHostname) {
                        tmp_txt.text('switch on for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/green.png');
                        chrome.tabs.sendMessage(tabid, {status: 'off'});
                    } else {
                        tmp_txt.text('switch off for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/red.png');
                        chrome.tabs.sendMessage(tabid, {status: 'on'});
                    }
                    
                    
                    
                    
                    if (!result.blacklist) {
                        result.blacklist = [];
                    }
                    var idx = result.blacklist.indexOf(currentHostname);
                    var tmp_txt = $('#tmp_txt');
                    if (tmp_txt.text() === 'switch off for ' + currentHostname) {
                        result.blacklist.push(currentHostname);
                        tmp_txt.text('switch on for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/green.png');
                        chrome.tabs.sendMessage(tabid, {status: 'off'});
                    } else {
                        result.blacklist.splice(idx, 1);
                        tmp_txt.text('switch off for ' + currentHostname);
                        $('#tmp_img').attr('src', '../media/buttons/red.png');
                        chrome.tabs.sendMessage(tabid, {status: 'on'});
                    }
                    chrome.storage.local.set({blacklist: result.blacklist});
                });
            });
        });
    });
});
