const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  // * Entry: 최조 진입점 | 자바스크립트 파일 경로입니다.
  // 엔트리 포인트는 1개가 될 수 있지만, 경우에 따라 여러개일 수도 있습니다.
  // SPA는 일반적으로 1개의 Entr포인트를 갖게 되지만, MPA는 페이지 단위로 엔트리 포인트를 분리할 수 있습니다.
  entry: path.resolve(__dirname, "../src/index.js"),

  // * Output: 웹팩을 돌린 이후 결과물의 파일 경로입니다.`
  output: {
    // filename: 빌드 파일 이름 + path: 파일의 경로
    hashFunction: "xxhash64",
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "../dist"),
  },

  // * SourceMap: 배포용 빌드 파일과 원본 파일을 서로 연결시켜주는 일종의 지도입니다.
  // 서버 배포를 할 때 성능 최적화를 위해 HTML, CSS, JS 등 웹 자원을 압축합니다.
  // 배포한 파일에서 에러가 발생한 경우, 디버깅을 목적으로 소스맵을 확인하게 됩니다.
  devtool: "source-map",

  // * Loader | Pluagin
  // ? Plugin: 웹팩의 기본적인 동작에 추가적인 기능을 제공하는 속성입니다.
  // 로더가 "파일을 해석 | 변환하는 과정"에 관여한다면,
  // 플러그인은 해당 "결과물의 형태를 바꾸는 것"에 관여합니다.
  plugins: [
    // * 플러그인은 클래스 생성자로 생성한 객체 인스턴스만 추가할 수 있습니다.
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "../static") }],
    }),
    // * HTMLWebpackPlugin: 웹 팩 빌드 결과물로 HTML 파일을 생성하는 플러그인.
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      minify: true,
    }),
    // * CSS 파일을 별도의 모듈로 분리합니다.

    new MiniCSSExtractPlugin(),
  ],

  // ? Loader: 웹팩이 웹 어플리케이션을 해석할 때, JS 파일이 아닌 다른 자원(HTML, CSS, IMG, Font 등)을 변환할 수 있도록 하는 속성입니다.
  module: {
    // * 일반적으로 사용되는 로더는 다음과 같습니다.
    // Babel Loader | Sass Loader | File Loader | Vue Loader | TS Loader
    rules: [
      // HTML
      {
        // * test: 로더를 적용할 파일 유형으로 일반적으로 정규식을 사용합니다.
        // * use: 해당 파일에 적용할 로더 명입니다.
        test: /\.(html)$/,
        use: ["html-loader"],
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },

      // CSS
      {
        test: /\.css$/,
        // * 여러 개의 로더를 사용하는 경우, 오른쪽에서 왼쪽 순으로 적용합니다.
        use: [MiniCSSExtractPlugin.loader, "css-loader"],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[hash][ext]",
        },
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[hash][ext]",
        },
      },
    ],
  },
};
