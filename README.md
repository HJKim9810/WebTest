# 정보처리기사 CBT 짜투리 학습

정보처리기사 필기 시험 대비용 정적 웹 퀴즈 앱입니다.

- 실전 100문제
- 과목별 집중
- 랜덤 연습
- 오답 복습
- 대시보드 개념공부
- 브라우저 자동 오답 저장
- 모바일 홈 화면 설치 지원

## 로컬 실행

브라우저에서 `index.html`을 열면 바로 실행됩니다.

```text
C:\Users\hyojun\WebTest\index.html
```

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더의 파일을 저장소에 올립니다.
3. GitHub 저장소에서 `Settings`로 이동합니다.
4. 왼쪽 메뉴에서 `Pages`를 엽니다.
5. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
6. Branch를 `main`, folder를 `/root`로 설정하고 저장합니다.
7. 잠시 뒤 표시되는 Pages URL을 폰에서 엽니다.

## 폰에서 쓰기

### Android Chrome

1. GitHub Pages URL을 엽니다.
2. 브라우저 메뉴를 누릅니다.
3. `홈 화면에 추가`를 선택합니다.

### iPhone Safari

1. GitHub Pages URL을 엽니다.
2. 공유 버튼을 누릅니다.
3. `홈 화면에 추가`를 선택합니다.

## 저장 방식

오답과 누적 통계는 서버가 아니라 브라우저의 `localStorage`에 저장됩니다.

따라서 PC와 폰의 기록은 서로 공유되지 않습니다. 폰에서 푼 오답은 폰 브라우저에 저장됩니다.

## 파일 구조

```text
index.html
styles.css
script.js
questions.js
manifest.json
service-worker.js
icon.svg
DESIGN.md
README.md
```
