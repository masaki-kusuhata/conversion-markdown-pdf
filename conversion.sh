# 現在地出力
pwd

# 
if [ -e dist ]; then
  rm -rf dist
  mkdir dist
else
    mkdir dist
fi

if [ -e pdf ]; then
  rm -rf pdf
  mkdir pdf
else
    mkdir pdf
fi

node guide/create-pdf.js

# 指定のディレクトリ配下に存在する拡張子が.mdのファイルを元にpdfファイルを作成する
find . -name '*.md' -print0 | while IFS= read -r -d $'' line; do
    markdown-pdf ${line} && mv ${line%.*}.pdf pdf 
done
