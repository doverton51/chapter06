'use strict';

after(function(done) {
    var d = (err) => {
        console.log('DONE: after ' + err);
        if(err) {
            done(err);
        } else {
            done();
        }
    };
    require('../src/config/mongoose.js')
    .then((mongoose) => {
        console.log('Closing DB Connection');
        mongoose.disconnect(d);
    });
});