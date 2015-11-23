require(['../js/common'], function(common) {
    require(['jquery'], function($) {
        $('#settings').click(function(e){
            e.preventDefault();
            chrome.runtime.openOptionsPage();
        });
        $('#feedback').click(function(e){
            e.preventDefault();
            chrome.tabs.create({'url': 'mailto:feedback@eexcess.eu?subject=EEXCESS browser extension feedback'});
        });
        chrome.tabs.query({'active': true}, function(tabs) {
            var url = tabs[0].url;
            var tabid = tabs[0].id;
            var tmp = document.createElement('a');
            tmp.href = url;
            if (url.startsWith('chrome') && !url.startsWith('chrome://newtab')) {
                $('#internal').show();
            } else {
                $('#switch').show();
                var currentHostname = tmp.hostname;
                $('#current_host').text(currentHostname);

                var active_mouseenter = function() {
                    $(this).attr('src', '../media/buttons/red2.png');
                };
                var active_mouseleave = function() {
                    $(this).attr('src', '../media/buttons/green.png');
                };
                var inactive_mouseenter = function() {
                    $(this).attr('src', '../media/buttons/green2.png');
                };
                var inactive_mouseleave = function() {
                    $(this).attr('src', '../media/buttons/red.png');
                };

                var active = function(id) {
                    $('#' + id + '_img').unbind('mouseenter', inactive_mouseenter);
                    $('#' + id + '_img').unbind('mouseleave', inactive_mouseleave);
                    $('#' + id + '_img').attr('src', '../media/buttons/green.png');
                    $('#' + id).attr('title', 'switch off');
                    $('#' + id + '_img').bind('mouseenter', active_mouseenter);
                    $('#' + id + '_img').bind('mouseleave', active_mouseleave);
                };
                var inactive = function(id) {
                    $('#' + id + '_img').unbind('mouseenter', active_mouseenter);
                    $('#' + id + '_img').unbind('mouseleave', active_mouseleave);
                    $('#' + id + '_img').attr('src', '../media/buttons/red.png');
                    $('#' + id).attr('title', 'switch on');
                    $('#' + id + '_img').bind('mouseenter', inactive_mouseenter);
                    $('#' + id + '_img').bind('mouseleave', inactive_mouseleave);
                };
                var broadcast_msg = function(msg) {
                    chrome.tabs.query({}, function(tabs) {
                        for (var i = 0, len = tabs.length; i < len; i++) {
                            chrome.tabs.sendMessage(tabs[i].id, msg);
                        }
                    });
                };
                chrome.storage.local.get(['blacklist', 'EEXCESS_off', 'whitelist'], function(result) {
                    var eexcess_off = result.EEXCESS_off;
                    var tmp_active;
                    var blacklist = result.blacklist || [];
                    var whitelist = result.whitelist || [];
                    var check_blacklist = function() {
                        if (blacklist.indexOf(currentHostname) !== -1) {
                            tmp_active = false;
                            inactive('tmp');
                        } else {
                            tmp_active = true;
                            active('tmp');
                        }
                    };
                    var check_whitelist = function() {
                        if (whitelist.indexOf(currentHostname) !== -1) {
                            tmp_active = true;
                            active('tmp');
                        } else {
                            tmp_active = false;
                            inactive('tmp');
                        }
                    };

                    // current state
                    if (eexcess_off) {
                        inactive('power');
                        check_whitelist();
                    } else {
                        active('power');
                        check_blacklist();
                    }

                    // global on/off
                    $('#power').click(function(e) {
                        if (eexcess_off) {
                            eexcess_off = false;
                            active('power');
                            chrome.storage.local.set({EEXCESS_off: false});
                            broadcast_msg({status: 'on'});
                            check_blacklist();
                        } else {
                            eexcess_off = true;
                            inactive('power');
                            chrome.storage.local.set({EEXCESS_off: true});
                            broadcast_msg({status: 'off'});
                            check_whitelist();
                        }
                    });
                    
                    // local on/off
                    $('#tmp').click(function(e) {
                        if (tmp_active) {
                            tmp_active = false;
                            inactive('tmp');
                            broadcast_msg({status: 'off', site:currentHostname});
                            if (eexcess_off) {
                                // remove from whitelist
                                whitelist.splice(whitelist.indexOf(currentHostname),1);
                                chrome.storage.local.set({whitelist:whitelist});
                            } else {
                                // add to blacklist
                                blacklist.push(currentHostname);
                                chrome.storage.local.set({blacklist:blacklist});
                                // remove from whitelist
                                var whitelist_idx = whitelist.indexOf(currentHostname);
                                if(whitelist_idx !== -1) {
                                    whitelist.splice(whitelist_idx, 1);
                                    chrome.storage.local.set({whitelist:whitelist});
                                }
                            }
                        } else {
                            tmp_active = true
                            active('tmp');
                            broadcast_msg({status: 'on', site:currentHostname});
                            if (eexcess_off) {
                                // add to whitelist
                                whitelist.push(currentHostname);
                                chrome.storage.local.set({whitelist:whitelist});
                                // remove from blacklist
                                var blacklist_idx = blacklist.indexOf(currentHostname);
                                if(blacklist_idx !== -1) {
                                    blacklist.splice(blacklist_idx,1);
                                    chrome.storage.local.set({blacklist:blacklist});
                                }
                            } else {
                                // remove from blacklist
                                blacklist.splice(blacklist.indexOf(currentHostname),1);
                                chrome.storage.local.set({blacklist:blacklist});
                            }
                        }
                    });
                });
            }
        });
    });
});
