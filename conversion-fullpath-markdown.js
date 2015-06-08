var fs = require("fs");
var path = require("path");
var markdownpdf = require("markdown-pdf");
var mkdirp = require('mkdirp');

// 処理対象ディレクトリパス
var TARGET_DIRECTORY_PATH = '.';
// Link取得の正規表現
var LINK_REG_EXP = /\(images.*\)/g;
// マークダウン取得の正規表現
var MARKDWON_REG_EXP = /.*\.md$/;
// マークダウンの文字コード
var MARKDOWN_CHAR_CODE = 'utf8';

// 対象のディレクトリに存在するファイル一覧を取得する
var getFileFullPaths = function (currentDirectoryPath, successCallback, errorCallback) {

  fs.readdir(currentDirectoryPath, function (err, files) {

    if (err) {
      return errorCallback(err);
    }

    files.forEach(function (itemName) {

      // フルパスを取得する
      var fullPath = getFullPath(itemName);

      if(fs.statSync(fullPath).isDirectory()) {

        // フォルダだった場合１つ下の階層を探索する
        getFileFullPaths(fullPath, successCallback);

      } else if(fs.statSync(fullPath).isFile()) {

        // ファイルだった場合、マークダウンファイルかチェックする
        if( MARKDWON_REG_EXP.test(itemName) ){
          successCallback(fullPath, errorCallback);
        }

      }
    });
  });
};

var getFullPath = function (itemName) {
  return path.join(currentDirectoryPath, itemName);
};

// マークダウンからLink文を抽出する処理
var getMarkdownLinks = function (fullPath, errorCallback){

  fs.readFile( fullPath, MARKDOWN_CHAR_CODE, function (err, contents) {

    if (err) {
      errorCallback(err);
      return;
    }

    // タイトル付Link文の取得
    var links = contents.match(LINK_REG_EXP);

    if(links !== null){

      links.forEach(function (linkStrings) {
        var tmp = linkStrings.substr(1);
        tmp = tmp.substr( 0 , (tmp.length-1) );
        contents = contents.replace(tmp, path.resolve(tmp));

        console.log(tmp);
        console.log(path.resolve(tmp));
      });

      fs.writeFile(fullPath, contents , errorCallback(err));

    }
  });
};

// マークダウンファイルをPDFに変換する
var convertMarkdownPdf = function (targetPath, outputPath, successCallback) {
  return markdownpdf().from(targetPath).to(outputPath, successCallback);
};

var outputErrorConsoleLog = function (err) {
  console.log("処理中にエラーが発生しました。:" + err);
}

var mkdir = function (path) {
  mkdirp( path, function (err) {
    if (err) {
      outputErrorConsoleLog(err);
    } else {
      console.log('success')
    }
  });
};

var action = function () {
  // マークダウンファイルのフルパスを取得する
  return getFileFullPaths(
    TARGET_DIRECTORY_PATH,
    getMarkdownLinks,
    outputErrorConsoleLog
  );
};
