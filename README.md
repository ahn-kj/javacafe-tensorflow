# 자바카페 텐서플로우 스터디 실습

* OCR 을 텐서플로우로 해보자
* web 으로 글자를 쓰면 인식해서 결과 도출

## MNIST 모듈 사용법 

* resize-script.sh 로 파일 resize
* convert-images-to-mnist-format.py 로 MNIST 생성됨.
* 스크립트 실행한 디렉토리 에 생성됨 


## Installation

```bash
brew install imagemagick
pip install pillow
brew search imagick
brew install php{version)-imagick
pip install flask
chmod 755 ./mnist/resize-script.sh
```
## Run Sample

## 프로그램 동작 상상도

![sequence](https://www.lucidchart.com/publicSegments/view/09820ea6-297f-47fa-8949-9045c7fe8e3f/image.png)

## 오늘 해볼 것

* 그림판에서 이미지 데이터 FLASK 로 전송 --> 현재는 로그만 찍음 --> Flask API 에서 특정경로에 파일저장

* mnist 생성된 이미지로 텐서플로우 연동해보기
