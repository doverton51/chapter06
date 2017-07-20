(function() {
    'use strict';
    var expect = require('chai').expect;
    var page = require('webpage').create();
    var rootUrl = 'http://localhost:' + 
    require('system').env.TEST_PORT || 3000;
    
    console.log('Root URL: ' + rootUrl);

    withGame('Example', function() {
        expect(getText('#word')).to.equal('_______');
         
        page.evaluate(function() {
            $(document).ajaxComplete(window.callPhantom);
        });
        
        page.sendEvent('keydown', page.event.key.E);
        page.onCallback = verify(function() {
            expect(getText('#word')).to.equal('E_____E');
            expect(getText('#missedLetters')).to.be.empty;
            
            page.sendEvent('keydown', page.event.key.T);
            page.onCallback = verify(function() {
                expect(getText('#word')).to.equal('E_____E');
                expect(getText('#missedLetters')).to.equal('T');

                console.log('Test completed successfully!');
                phantom.exit();
            });
        });
    });
    
    function withGame(word, callback) {
        page.open(rootUrl + '/', function() {
            
            page.evaluateAsync(function(w) {
                $('input[name=word]').val(w);
                $('form#createGame').submit();
            }, 0, word);
                
            page.evaluate(function() {
                $(document).ajaxComplete(window.callPhantom);
            });
            
            page.onCallback = function() {
                var gamePath = page.evaluate(function() {
                    return $('#createdGames .game a').first().attr('href');
                });
                
                page.onCallback = undefined;
                page.clearCookies();
                
                page.open(rootUrl + gamePath, verify(callback));
            };
        });
    }
    
    function getText(selector) {
        return page.evaluate(function(s) {
            return $(s).text();
        }, selector);
    }
    
    function verify(expectations) {
        return function() { 
            try {
                expectations();
            } catch(e) {
                console.log('Test failed!');
                console.log(e);
                throw e;
            }
        };
    }
    
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    };

    // http://phantomjs.org/api/webpage/handler/on-error.html
    page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
        msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }

    console.error(msgStack.join('\n'));
    };

    // http://phantomjs.org/api/webpage/handler/on-resource-error.html
    page.onResourceError = function(resourceError) {
    console.log('Unable to load resource (#' + resourceError.id + ' URL:' + resourceError.url + ')');
    console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    };

    // http://phantomjs.org/api/webpage/handler/on-resource-timeout.html
    page.onResourceTimeout = function(request) {
        console.log('Response Timeout (#' + request.id + '): ' + JSON.stringify(request));
    };
}());
