var fs = require('fs');

function Reader(rootDir) {
  this.rootDir = rootDir;
}

Reader.prototype.readDirsRecursive = function(srcPath, dstPath) {
  this.sourceMap   = _readDirRecursive(this.rootDir + srcPath);
  this.resourceMap = _readDirRecursive(this.rootDir + (dstPath == '/' ? '' : dstPath), this.sourceMap.exectDirs, false);
  return this;
};

Reader.prototype.clear = function() {
  _clearSourceDist(this.sourceMap.reading, this.resourceMap.reading, this.rootDir);
  _clearSourceDist(this.sourceMap.reading, this.resourceMap.reading, this.rootDir);
};

Reader.factory = function(rootDir) {
    return new Reader(rootDir);
};

function _readDirRecursive (path, exectDirs, isSource) {
  exectDirs  = exectDirs || [];
  isSource   = isSource === false ? isSource : true;
  var rootDir = path;

  var res = { exectDirs : [] };
  res.reading = readingRecursive(path);

  function readingRecursive (path) {
    var result = {}, filesArray = [];
    var readResult = fs.readdirSync(path);
    readResult.forEach(function (subject) {
      var subjectPath = path + '/' + subject;
      writeObj: if (fs.statSync(subjectPath).isDirectory()) {
        var shellReturn = {};
        if (path == rootDir && !isSource) {
          shellReturn = true;
          exectDirs.forEach(function (exectDir) {
            if (exectDir === subject) shellReturn = false;
          });
          if (shellReturn) break writeObj;
        }
        result[ subject ] = readingRecursive(subjectPath);
      }
      else filesArray.push(subject);
    });
    if (filesArray.length > 0) result.qwertyfl = filesArray;
    return result;
  }

  //dirs that should be read only in source files root
  if (isSource) {
    var readResult = fs.readdirSync(path);
    readResult.forEach(function (subject) {
      var subjectPath = path + '/' + subject;
      if (fs.statSync(subjectPath).isDirectory()) res.exectDirs.push(subject);
    });
  } else delete res.exectDirs;

  delete res.reading.qwertyfl;
  return res;
}

function _clearSourceDist (sourceMap, resourceMap, path) {
  for (var name in resourceMap) {
    if (!resourceMap.hasOwnProperty(name)) continue;
    if (name !== 'qwertyfl') {
      var dirPath = path + '/' + name;
      if (!(name in sourceMap) && !resourceMap[ name ].qwertyfl) {
        fs.rmdirSync(dirPath);
        console.log('Directory removed: ', dirPath)
      }
      else _clearSourceDist(sourceMap[ name ], resourceMap[ name ], dirPath);
    } else {
      var resourceFiles = (resourceMap && resourceMap[ name ]) || [];
      var sourceFiles = (sourceMap && sourceMap[ name ]) || [];
      var filesDiff = diffArray(resourceFiles, sourceFiles);
      if (filesDiff.length === 0) continue;
      filesDiff.forEach(function (file) {
        fs.unlink(path + '/' + file);
        console.log('File unlinked: '+ path + '/' + file+"\n")
      });
    }
  }
  function diffArray (a, b) {
    var seen = [], diff = [];
    for (var i = 0; i < b.length; i++)
      seen[ b[ i ] ] = true;
    for (var i = 0; i < a.length; i++)
      if (!seen[ a[ i ] ])
        diff.push(a[ i ]);
    return diff;
  }
}

module.exports = Reader;
