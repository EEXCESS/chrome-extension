require(['../js/common'], function(common) {
    require(['jquery'], function($) {
        chrome.tabs.query({'active': true}, function(tabs) {
            var url = tabs[0].url;
            var tabid = tabs[0].id;
            var tmp = document.createElement('a');
            tmp.href = url;
            if (url.startsWith('chrome') && !url.startsWith('chrome://newtab')) {
                $('#internal').show();
                $('#switch').hide();
            } else {
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
                    $('#' + id + '_txt').text('EEXCESS is active');
                    $('#' + id + '_img').bind('mouseenter', active_mouseenter);
                    $('#' + id + '_img').bind('mouseleave', active_mouseleave);
                };
                var inactive = function(id) {
                    $('#' + id + '_img').unbind('mouseenter', active_mouseenter);
                    $('#' + id + '_img').unbind('mouseleave', active_mouseleave);
                    $('#' + id + '_img').attr('src', '../media/buttons/red.png');
                    $('#' + id).attr('title', 'switch on');
                    $('#' + id + '_txt').text('EEXCESS is inactive');
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
                    var check_blacklist = function() {
                        if (result.blacklist && result.blacklist.indexOf(currentHostname) !== -1) {
                            inactive('tmp');
                        } else {
                            active('tmp');
                        }
                    };
                    var check_whitelist = function() {
                        if (result.whitelist && result.whitelist.indexOf(currentHostname) !== -1) {
                            active('tmp');
                        } else {
                            inactive('tmp');
                        }
                    };

                    // current state
                    if (result.EEXCESS_off) {
                        inactive('power');
                        check_whitelist();
                    } else {
                        active('power');
                        check_blacklist();
                    }

                    // handle interaction
                    $('#power').click(function(e) {
                        if ($('#power_txt').text() === 'EEXCESS is inactive') {
                            active('power');
                            chrome.storage.local.set({EEXCESS_off: false});
                            broadcast_msg({status: 'on'});
                            check_blacklist();
                        } else {
                            inactive('power');
                            chrome.storage.local.set({EEXCESS_off: true});
                            broadcast_msg({status: 'off'});
                            check_whitelist();
                        }
                    });
                    $('#tmp').click(function(e) {
                        if ($('#tmp_txt').text() === 'EEXCESS is active') {
                            inactive('tmp');
                            chrome.tabs.sendMessage(tabid, {status: 'off'});
                            if (result.EEXCESS_off) {
                                // remove from whitelist
                                result.whitelist.splice(result.whitelist.indexOf(currentHostname),1);
                                chrome.storage.local.set({whitelist:result.whitelist});
                            } else {
                                // add to blacklist
                                if(!result.blacklist) {
                                    result.blacklist = [];
                                }
                                result.blacklist.push(currentHostname);
                                chrome.storage.local.set({blacklist:result.blacklist});
                            }
                        } else {
                            active('tmp');
                            chrome.tabs.sendMessage(tabid, {status: 'on'});
                            if (result.EEXCESS_off) {
                                if(!result.whitelist) {
                                    result.whitelist = [];
                                }
                                result.whitelist.push(currentHostname);
                                chrome.storage.local.set({whitelist:result.whitelist});
                            } else {
                                // remove from blacklist
                                result.blacklist.splice(result.blacklist.indexOf(currentHostname),1);
                                chrome.storage.local.set({blacklist:result.blacklist});
                            }
                        }
                    });
                });
            }





        });
    });
});
