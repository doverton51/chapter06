'use strict';

before(function(done) {
    require('../src/config/redis.js').flushdbAsync()
    .then(() => done());
});

after(function(done) {
    var d = (err) => {
        console.log('DONE: after ' + err);
        if(err) {
            done(err);
        } else {
            done();
        }
    };

    require('../src/config/redis.js').quit();

    require('../src/config/mongoose.js')
    .then((mongoose) => {
        console.log('Closing DB Connection');
        mongoose.disconnect(d);
    });
});