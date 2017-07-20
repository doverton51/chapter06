'use strict';

after(function(done) {
    require('../src/config/mongoose.js')
    .then((mongoose) => {
        console.log('Closing DB Connection');
        mongoose.disconnect(done);
    });
});