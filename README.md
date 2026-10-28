# MakeCode micro:bit SVG Exporter
**if you want to read english version, README_en is [here](/README_en.md)!!**  
MakeCode micro:bitのプログラムブロックを、付箋なしの単体SVGとして直接保存するChrome拡張機能です。サーバー通信や外部変換ソフトは使用しません。

## 使い方
0. [リリースページ](https://github.com/unicha71/makecode-svg/releases)からzipファイルをダウンロードし、適当なところに展開する。
1. Chromeで `chrome://extensions` を開く。
2. 「デベロッパーモード」を有効にする。
3. 「パッケージ化されていない拡張機能を読み込む」で、この `svg_only` フォルダーを選ぶ。
4. [MakeCode micro:bit](https://makecode.microbit.org/)でプログラムを表示する。
5. 拡張機能のポップアップで「SVGで保存」を押す。

MakeCodeページを右クリックし、「SVGでエクスポート」を選んで保存することもできます。

## 注意

この拡張機能を利用してダウンロードした画像は、Microsoft Wordで正しく表示されません。これはword内のsvg解釈機能が不完全であるためで、wordにmakecodeのベクタ画像を挿入するにはinkscapeなどの外部ソフトを使い、svg→emf変換を行う必要があります。

### inkscapeを用いた変換の方法
**STEP0**  
inkscapeをダウンロードし、インストールする  

**STEP1**   
拡張機能をイントールするとアドレスバーの横か、ジグソーパズルのアイコンの中にこのアイコンが出現するのでプログラム画面を開いた状態でクリックし、"SVGで保存する"と書かれている青いボタンをクリックしてSVG画像をダウンロードします。  
![img1](/images/image.png)  

**STEP2**  
inkscapeを起動し、Openボタンを押してダウンロードした画像を選択する。
![img2](/images/image%20copy.png)   
**STEP3**   
成功すると以下のような画面になるはず。 
![img3](/images/image%20copy%202.png)  
プログラムの画像をドラッグして、白い正方形の大体真ん中にプログラムが来るようにする。  
↓こんな感じ↓  
![img35](/images/image%20copy%205.png)  
**STEP4**  
左上のファイル→名前を付けて保存を選択  
![img4](/images/image%20copy%203.png)  
ファイルの種類 ドロップダウンで 拡張メタファイル(.emf)を選択する  
![img5](/images/image%20copy%204.png)  
保存ボタンを押す。場合によってはどういう設定でエクスポートするかみたいな黒いウィンドウが出てくることがあるが、そのままOKでおｋ。  
**STEP5**  
出来たemfファイルを通常の画像と同じ要領でwordに張り付ける。  
![img6](/images/image%20copy%206.png)  
そして勝利を得る。


## 支援

- ~~外部サーバを使ってsvg→emf変換を行い、wordに挿入できるemfファイルををダウンロードするバージョンのテスターを若干名募集しています。変換サーバは私の自宅サーバなので、もし他人の個人サーバにアクセスしてテストに参加しても良いよという方、ワンクリックでwordに貼り付けたい方はご検討ください。~~
- svg-emf変換をワンクリックで行うバージョンも開発中ですが外部ソフトやサーバを使わずに変換を行う良い案が思いつかないので、もし何か思いついた方はお知らせください。

## その他
裏話（ちょっとだけ詳細な情報）は[こちら](https://uni-cbg.com/post/547)
