var FILE_SYSTEM = require("fs");
var PATH = require("path");

// 処理対象ディレクトリパス
var TARGET_DIRECTORY_PATH = '.';
// Link取得の正規表現
var LINK_REG_EXP = /\(images.*\)/g;

// 対象のディレクトリに存在するファイル一覧を取得する
var getFileFullPaths = function (currentDirectoryPath, successCallback, errorCallback) {

    FILE_SYSTEM.readdir(currentDirectoryPath, function (err, files) {

        if (err) {
            errorCallback(err);
            return;
        }

        files.forEach(function (itemName) {
            var fullPath = PATH.join(currentDirectoryPath, itemName);
            if(FILE_SYSTEM.statSync(fullPath).isDirectory()) {
                // フォルダだった場合１つ下の階層を探索する
                getFileFullPaths(fullPath, successCallback);
            } else {
                // ファイルの存在する　かつ　マークダウンファイル
                if(FILE_SYSTEM.statSync(fullPath).isFile() && /.*\.md$/.test(itemName) ){
                    successCallback(fullPath, errorCallback);
                }
            }
        });
    });
};

// マークダウンからLink文を抽出する処理
var getMarkdownLinks = function (fullPath, errorCallback){

    FILE_SYSTEM.readFile( fullPath, 'utf8', function (err, contents) {

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
            	contents = contents.replace(tmp, PATH.resolve('guide/' + tmp));
                console.log(tmp);
                console.log(PATH.resolve('guide/' + tmp));
            });

            FILE_SYSTEM.writeFile(fullPath, contents , function (err) {
			    console.log(err);
			});
        }
    });
};

// マークダウンファイルのフルパスを取得する
getFileFullPaths(
    TARGET_DIRECTORY_PATH, 
    getMarkdownLinks,
    function (err) {
        console.log("リンク切れチェック中にエラーが発生しました。:" + err);
    }
);