# Json data to html string(table)
[테스트 페이지](https://humonnom.github.io/size-table/)

### Example(Input, Output)
* Input (Json data)
```json
{
  "S": {
    "총장": "46.4",
    "허리(포켓 달리는 위치)": "36.5",
    "엉덩이": "43.5"
  },
  "M": {
    "총장": "48.4",
    "허리(포켓 달리는 위치)": "38.6",
    "엉덩이": "45.5"
  }
}
```
* Export (Html string)


### 설명

* 기존: 어드민에서 브랜드가 자신의 브랜드 size table을 저장할 수 있었음
* 필요했던 이유: 샵바이 이관 이후, 기존의 table data를 이관하는 것이 불가능
   * custom data를 집어넣는게 가능한데, 게시판 데이터같이 html을 등록하면 html이 string으로 저장되고 그걸 프론트에서 불러와서 그대로 그려내는 방법
* 해결 방법
   * 기존 데이터 이관시 Json을 table 형태의 html로 바꾸어 custom data으로 저장
   * 새로 입력하는 경우 이미지를 직접 업로드 
