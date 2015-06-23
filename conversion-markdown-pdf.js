'use strict';

var fs = require('fs');
var path = require('path');
var markdownpdf = require('markdown-pdf');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var del = require('del');

// 処理対象ディレクトリパス
var TARGET_DIRECTORY_PATH = '.';

// Link取得の正規表現
var LINK_REG_EXP = /\(images.*\)/g;

// マークダウン取得の正規表現
var MARKDWON_REG_EXP = /.*\.md$/;

// マークダウンの文字コード
var MARKDOWN_CHAR_CODE = 'utf8';

var NCP_LIMIT = 16;

// マークダウンの拡張子
var MARKDOWN_EXP = '.md';

// マークダウンの拡張子
var PDF_EXP = '.pdf';

// 作業用ディレクトリの作成
var WORKING_DIR_NAME = 'tmp';

// PDF格納用用ディレクトリの作成
var PDF_DIR_NAME = 'pdf';

var getFullPath = function(pathStr) {
  return path.resolve(WORKING_DIR_NAME, pathStr);
};

var dirList = [];
var fileList = [];

/**
 * ディレクトリを作成する
 */
var mkdir = function(path) {
  mkdirp(path, function(err) {
    if (err) {
      throw err;
    }
  });
};

var getPaths = function(currentDirectoryPath) {

  fs.readdir(currentDirectoryPath, function(err, paths) {

    if (err) {
      throw err;
    }

    paths.forEach(function(pathStr) {

      // フルパスを取得する
      // var fullPath = getFullPath(pathStr);
      var fullPath = currentDirectoryPath + '/' + pathStr;

      if (fs.statSync(fullPath).isDirectory()) {
        dirList.push(fullPath);

        // フォルダだった場合１つ下の階層を探索する
        getPaths(fullPath);

      } else if (fs.statSync(fullPath).isFile()) {

        // ファイルだった場合、マークダウンファイルかチェックする
        if (MARKDWON_REG_EXP.test(fullPath)) {
          convertRelativePathToFullPath(fullPath, currentDirectoryPath);
          fileList.push(fullPath);
        }
      }
    });
  });
};

// マークダウンからLink文を抽出する処理
var convertRelativePathToFullPath = function(fullPath, currentDirectoryPath) {

  fs.readFile(fullPath, MARKDOWN_CHAR_CODE, function(err, contents) {

    if (err) {
      throw err;
    }

    // イメージのURLを取得
    var imgSources = contents.match(LINK_REG_EXP);

    if (imgSources !== null) {

      imgSources.forEach(function(imgSource) {
        var imgSource = imgSource.substr(1);
        imgSource = imgSource.substr(0, (imgSource.length　 - 　1));
        var tmp = imgSource;
        if (!path.isAbsolute(tmp)) {
          for (var i = 0; i < dirList.length; i++) {
            tmp = path.resolve(dirList[i], imgSource);
            if (path.isAbsolute(tmp)) {
              break;
            }
          }
        }

        contents = contents.replace(imgSource, tmp);
      });
    }

    fs.writeFile(fullPath, contents, function(err) {
      if (err) {
        throw err;
      }

      var pdfFullPath = PDF_DIR_NAME + '/' + path.basename(fullPath, MARKDOWN_EXP) + PDF_EXP;
      convertMarkdownPdf(fullPath, pdfFullPath, function() {
        console.log('PDF化完了：' + fullPath);
      });

    });
  });
};

// マークダウンファイルをPDFに変換する
var convertMarkdownPdf = function(targetPath, outputPath, successCallback) {
  return markdownpdf().from(targetPath).to(outputPath, successCallback);
};

var action = function() {
  try {
    del([PDF_DIR_NAME, WORKING_DIR_NAME], function() {
      // PDF格納用ディレクトリの作成
      mkdir(PDF_DIR_NAME);

      // 作業用ディレクトリの作成
      mkdir(WORKING_DIR_NAME);

      // 作業用ディレクトリに資産をコピー
      ncp.limit = NCP_LIMIT;
      ncp(process.argv[2], WORKING_DIR_NAME, function(err) {
        if (err) {
          throw err;
        }else {
          getPaths(WORKING_DIR_NAME);
        }
      });
    });

  } catch (e) {
    console.log(e);
  }
};

action();
