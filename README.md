##Install

```$ npm install dirs-clear-sync --save-dev```

##Usage
```js
//modules
const gulp     = require("gulp");
const babel    = require("gulp-babel");
const changed  = require("gulp-changed");

const garbageCollector = require("dirs-clear-sync").factory(__dirname);

//paths

let src = './src/**/*';

let dst = './';

//tasks
gulp.task('gc', () => {
    //in my actionhero project it takes about 20 ms, to finish it
    garbageCollector.readDirsRecursive('/src','/').clear();
});

gulp.task('transpose', ['gc'], () => {
    return gulp.src(src)
            .pipe(changed(dst))
            .pipe(babel({
            presets: [ 'es2015' ]
            }))
    .pipe(gulp.dest(dst));
});
```
