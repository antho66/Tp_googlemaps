var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var livereload = require("gulp-livereload");

gulp.task("sass" ,function(){
    return gulp .src("./sass/styles.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error" , sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./Eleve'))
    .pipe(livereload());
});

gulp.task("watch", function(){
    livereload.listen();
    gulp.watch("./sass/*.scss",["sass"]);

})

